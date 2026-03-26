import { prisma } from "@/lib/prisma";
import {
  eachDayOfInterval,
  format,
  startOfDay,
  startOfWeek,
  subDays,
  subWeeks,
} from "date-fns";

const WEEK_OPTIONS = { weekStartsOn: 1 as const };

type DailyCountRow = {
  play_day: Date;
  play_count: number | bigint;
};

type DistinctDayRow = {
  play_day: Date;
};

type HeatmapRow = {
  day_of_week: number | bigint;
  hour_of_day: number | bigint;
  play_count: number | bigint;
};

type DiscoveryRow = {
  week_start: Date;
  total_plays: number | bigint;
  first_listen_plays: number | bigint;
};

export type TrackGroup = {
  spotifyTrackId: string;
  trackName: string;
  artistName: string;
  albumName: string | null;
  albumImage: string | null;
  _count: {
    spotifyTrackId: number;
  };
};

export type ArtistGroup = {
  artistName: string;
  _count: {
    artistName: number;
  };
};

export type PlayHistoryTrack = {
  spotifyTrackId: string;
  trackName: string;
  artistName: string;
  albumName: string | null;
  albumImage: string | null;
  playedAt: Date;
};

export type ListeningMomentum = {
  currentWeekPlayCount: number;
  rollingFourWeekAverage: number;
  percentageChange: number | null;
  streakDays: number;
  lastPlayedTrack: PlayHistoryTrack | null;
  dailyCounts: Array<{
    date: string;
    count: number;
  }>;
};

export type MiniWrapped = {
  topArtist: {
    artistName: string;
    playCount: number;
  } | null;
  topTrack: {
    spotifyTrackId: string;
    trackName: string;
    artistName: string;
    albumImage: string | null;
    playCount: number;
  } | null;
  peakHour: {
    hour: number;
    label: string;
    playCount: number;
  } | null;
  uniqueArtistCount: number;
};

export type HeatmapCell = {
  day: number;
  hour: number;
  count: number;
};

export type DiscoveryRatePoint = {
  weekStart: string;
  totalPlays: number;
  firstListenPlays: number;
  percentage: number;
};

export type ArtistLoyaltyRow = {
  artistName: string;
  totalPlays: number;
  sharePercentage: number;
  trend: "up" | "down" | "flat";
  currentWeekPlays: number;
  previousWeekPlays: number;
};

function getWeekStart(date: Date) {
  return startOfWeek(date, WEEK_OPTIONS);
}

function formatHourLabel(hour: number) {
  const normalized = hour % 24;
  const suffix = normalized >= 12 ? "PM" : "AM";
  const hour12 = normalized % 12 === 0 ? 12 : normalized % 12;
  return `${hour12}:00 ${suffix}`;
}

// Top tracks this week
export async function getTopTracksThisWeek(userId: string) {
  return prisma.playHistory.groupBy({
    by: ["spotifyTrackId", "trackName", "artistName", "albumName", "albumImage"],
    where: { userId, playedAt: { gte: getWeekStart(new Date()) } },
    _count: { spotifyTrackId: true },
    orderBy: { _count: { spotifyTrackId: "desc" } },
    take: 8,
  });
}

// Top artists this week
export async function getTopArtistsThisWeek(userId: string) {
  return prisma.playHistory.groupBy({
    by: ["artistName"],
    where: { userId, playedAt: { gte: getWeekStart(new Date()) } },
    _count: { artistName: true },
    orderBy: { _count: { artistName: "desc" } },
    take: 8,
  });
}

// New tracks this week
export async function getNewTracksThisWeek(userId: string) {
  return prisma.playHistory.findMany({
    where: { userId, isNewTrack: true, playedAt: { gte: getWeekStart(new Date()) } },
    orderBy: { playedAt: "desc" },
    take: 10,
  });
}

// Recently played
export async function getRecentlyPlayed(userId: string) {
  return prisma.playHistory.findMany({
    where: { userId },
    orderBy: { playedAt: "desc" },
    take: 15,
  });
}

export async function getLatestPlayHistoryUpdate(userId: string) {
  return prisma.playHistory.findFirst({
    where: { userId },
    orderBy: { createdAt: "desc" },
    select: {
      createdAt: true,
      playedAt: true,
      trackName: true,
      artistName: true,
    },
  });
}

// Momentum: play counts per day for last 28 days, streak calculation
export async function getListeningMomentum(userId: string): Promise<ListeningMomentum> {
  const today = startOfDay(new Date());
  const last28Start = startOfDay(subDays(today, 27));
  const currentWeekStart = getWeekStart(today);

  const [dailyCountsRows, distinctDaysRows, lastPlayedTrack] = await Promise.all([
    prisma.$queryRaw<DailyCountRow[]>`
      SELECT DATE("playedAt") AS play_day, COUNT(*)::int AS play_count
      FROM "PlayHistory"
      WHERE "userId" = ${userId}
        AND "playedAt" >= ${last28Start}
      GROUP BY DATE("playedAt")
      ORDER BY DATE("playedAt") ASC
    `,
    prisma.$queryRaw<DistinctDayRow[]>`
      SELECT DISTINCT DATE("playedAt") AS play_day
      FROM "PlayHistory"
      WHERE "userId" = ${userId}
      ORDER BY play_day DESC
      LIMIT 366
    `,
    prisma.playHistory.findFirst({
      where: { userId },
      orderBy: { playedAt: "desc" },
      select: {
        spotifyTrackId: true,
        trackName: true,
        artistName: true,
        albumName: true,
        albumImage: true,
        playedAt: true,
      },
    }),
  ]);

  const dailyCountMap = new Map(
    dailyCountsRows.map((row) => [format(new Date(row.play_day), "yyyy-MM-dd"), Number(row.play_count)])
  );

  const dailyCounts = eachDayOfInterval({
    start: last28Start,
    end: today,
  }).map((date) => {
    const key = format(date, "yyyy-MM-dd");
    return {
      date: key,
      count: dailyCountMap.get(key) ?? 0,
    };
  });

  const currentWeekPlayCount = dailyCounts
    .filter((entry) => new Date(`${entry.date}T00:00:00`) >= currentWeekStart)
    .reduce((sum, entry) => sum + entry.count, 0);

  const rollingFourWeekAverage =
    dailyCounts.reduce((sum, entry) => sum + entry.count, 0) / 4;

  const percentageChange =
    rollingFourWeekAverage === 0
      ? null
      : ((currentWeekPlayCount - rollingFourWeekAverage) / rollingFourWeekAverage) * 100;

  const distinctDays = new Set(
    distinctDaysRows.map((row) => format(new Date(row.play_day), "yyyy-MM-dd"))
  );

  let streakDays = 0;
  let cursor = today;
  while (distinctDays.has(format(cursor, "yyyy-MM-dd"))) {
    streakDays += 1;
    cursor = subDays(cursor, 1);
  }

  return {
    currentWeekPlayCount,
    rollingFourWeekAverage,
    percentageChange,
    streakDays,
    lastPlayedTrack,
    dailyCounts,
  };
}

// Mini Wrapped: top artist, top track, peak hour, unique artist count - rolling 30 days
export async function getMiniWrapped(userId: string): Promise<MiniWrapped> {
  const since = startOfDay(subDays(new Date(), 29));

  const [plays, topArtist, topTrack] = await Promise.all([
    prisma.playHistory.findMany({
      where: {
        userId,
        playedAt: { gte: since },
      },
      select: {
        artistName: true,
        playedAt: true,
      },
    }),
    prisma.playHistory.groupBy({
      by: ["artistName"],
      where: {
        userId,
        playedAt: { gte: since },
      },
      _count: { artistName: true },
      orderBy: { _count: { artistName: "desc" } },
      take: 1,
    }),
    prisma.playHistory.groupBy({
      by: ["spotifyTrackId", "trackName", "artistName", "albumImage"],
      where: {
        userId,
        playedAt: { gte: since },
      },
      _count: { spotifyTrackId: true },
      orderBy: { _count: { spotifyTrackId: "desc" } },
      take: 1,
    }),
  ]);

  const uniqueArtistCount = new Set(plays.map((play) => play.artistName)).size;
  const hourlyCounts = Array.from({ length: 24 }, () => 0);

  for (const play of plays) {
    hourlyCounts[play.playedAt.getHours()] += 1;
  }

  const peakHour = hourlyCounts.reduce(
    (best, playCount, hour) =>
      playCount > best.playCount ? { hour, playCount } : best,
    { hour: 0, playCount: 0 }
  );

  return {
    topArtist: topArtist[0]
      ? {
          artistName: topArtist[0].artistName,
          playCount: topArtist[0]._count.artistName,
        }
      : null,
    topTrack: topTrack[0]
      ? {
          spotifyTrackId: topTrack[0].spotifyTrackId,
          trackName: topTrack[0].trackName,
          artistName: topTrack[0].artistName,
          albumImage: topTrack[0].albumImage,
          playCount: topTrack[0]._count.spotifyTrackId,
        }
      : null,
    peakHour:
      peakHour.playCount > 0
        ? {
            hour: peakHour.hour,
            label: formatHourLabel(peakHour.hour),
            playCount: peakHour.playCount,
          }
        : null,
    uniqueArtistCount,
  };
}

// Heatmap: group by day of week (0-6) and hour (0-23), count plays
export async function getHeatmapData(userId: string): Promise<HeatmapCell[]> {
  const rows = await prisma.$queryRaw<HeatmapRow[]>`
    SELECT
      EXTRACT(DOW FROM "playedAt")::int AS day_of_week,
      EXTRACT(HOUR FROM "playedAt")::int AS hour_of_day,
      COUNT(*)::int AS play_count
    FROM "PlayHistory"
    WHERE "userId" = ${userId}
    GROUP BY 1, 2
    ORDER BY 1, 2
  `;

  return rows.map((row) => ({
    day: (Number(row.day_of_week) + 6) % 7,
    hour: Number(row.hour_of_day),
    count: Number(row.play_count),
  }));
}

// Discovery rate: per week for last 12 weeks, % of plays that were first listens
export async function getDiscoveryRate(userId: string): Promise<DiscoveryRatePoint[]> {
  const currentWeekStart = getWeekStart(new Date());
  const startWindow = getWeekStart(subWeeks(currentWeekStart, 11));

  const rows = await prisma.$queryRaw<DiscoveryRow[]>`
    WITH first_plays AS (
      SELECT
        "spotifyTrackId",
        MIN("playedAt") AS first_played_at
      FROM "PlayHistory"
      WHERE "userId" = ${userId}
      GROUP BY "spotifyTrackId"
    ),
    weekly_plays AS (
      SELECT
        DATE_TRUNC('week', ph."playedAt")::date AS week_start,
        COUNT(*)::int AS total_plays,
        SUM(
          CASE
            WHEN DATE_TRUNC('week', fp.first_played_at) = DATE_TRUNC('week', ph."playedAt")
            THEN 1
            ELSE 0
          END
        )::int AS first_listen_plays
      FROM "PlayHistory" ph
      INNER JOIN first_plays fp
        ON fp."spotifyTrackId" = ph."spotifyTrackId"
      WHERE ph."userId" = ${userId}
        AND ph."playedAt" >= ${startWindow}
      GROUP BY 1
      ORDER BY 1
    )
    SELECT week_start, total_plays, first_listen_plays
    FROM weekly_plays
  `;

  const rowMap = new Map(
    rows.map((row) => [
      format(new Date(row.week_start), "yyyy-MM-dd"),
      {
        totalPlays: Number(row.total_plays),
        firstListenPlays: Number(row.first_listen_plays),
      },
    ])
  );

  return Array.from({ length: 12 }, (_, index) => {
    const weekStart = getWeekStart(subWeeks(currentWeekStart, 11 - index));
    const key = format(weekStart, "yyyy-MM-dd");
    const values = rowMap.get(key) ?? { totalPlays: 0, firstListenPlays: 0 };

    return {
      weekStart: key,
      totalPlays: values.totalPlays,
      firstListenPlays: values.firstListenPlays,
      percentage:
        values.totalPlays === 0
          ? 0
          : (values.firstListenPlays / values.totalPlays) * 100,
    };
  });
}

// Artist loyalty: top 10 artists by all-time play count with share % and WoW trend
export async function getArtistLoyalty(userId: string): Promise<ArtistLoyaltyRow[]> {
  const currentWeekStart = getWeekStart(new Date());
  const previousWeekStart = subWeeks(currentWeekStart, 1);

  const [topArtists, totalPlayCount, currentWeekGroups, previousWeekGroups] =
    await Promise.all([
      prisma.playHistory.groupBy({
        by: ["artistName"],
        where: { userId },
        _count: { artistName: true },
        orderBy: { _count: { artistName: "desc" } },
        take: 10,
      }),
      prisma.playHistory.count({
        where: { userId },
      }),
      prisma.playHistory.groupBy({
        by: ["artistName"],
        where: {
          userId,
          playedAt: { gte: currentWeekStart },
        },
        _count: { artistName: true },
      }),
      prisma.playHistory.groupBy({
        by: ["artistName"],
        where: {
          userId,
          playedAt: {
            gte: previousWeekStart,
            lt: currentWeekStart,
          },
        },
        _count: { artistName: true },
      }),
    ]);

  const currentWeekMap = new Map(
    currentWeekGroups.map((entry) => [entry.artistName, entry._count.artistName])
  );
  const previousWeekMap = new Map(
    previousWeekGroups.map((entry) => [entry.artistName, entry._count.artistName])
  );

  return topArtists.map((artist) => {
    const currentWeekPlays = currentWeekMap.get(artist.artistName) ?? 0;
    const previousWeekPlays = previousWeekMap.get(artist.artistName) ?? 0;
    const trend =
      currentWeekPlays > previousWeekPlays
        ? "up"
        : currentWeekPlays < previousWeekPlays
          ? "down"
          : "flat";

    return {
      artistName: artist.artistName,
      totalPlays: artist._count.artistName,
      sharePercentage:
        totalPlayCount === 0
          ? 0
          : (artist._count.artistName / totalPlayCount) * 100,
      trend,
      currentWeekPlays,
      previousWeekPlays,
    };
  });
}
