/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import {
  getHeatmapData,
  getLatestPlayHistoryUpdate,
  getListeningMomentum,
  getMiniWrapped,
  getRecentlyPlayed,
  getTopArtistsThisWeek,
  getTopTracksThisWeek,
} from "@/lib/dashboard/queries";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { HeatmapGrid } from "@/app/dashboard/_components/HeatmapGrid";

function formatPlayedAt(value: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    day: "numeric",
    month: "short",
  }).format(value);
}

function formatStatusTime(value: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    day: "numeric",
    month: "short",
  }).format(value);
}

export default async function DashboardHomePage() {
  const user = await getCurrentUser();

  if (!user) {
    return null;
  }

  const [
    topTracks,
    topArtists,
    recentPlays,
    latestPlayHistoryUpdate,
    listeningMomentum,
    miniWrapped,
    heatmapData,
  ] = await Promise.all([
    getTopTracksThisWeek(user.id),
    getTopArtistsThisWeek(user.id),
    getRecentlyPlayed(user.id),
    getLatestPlayHistoryUpdate(user.id),
    getListeningMomentum(user.id),
    getMiniWrapped(user.id),
    getHeatmapData(user.id),
  ]);

  const momentumDirection =
    listeningMomentum.percentageChange === null
      ? "No baseline yet"
      : listeningMomentum.percentageChange >= 0
        ? `+${listeningMomentum.percentageChange.toFixed(1)}% vs 4-week average`
        : `${listeningMomentum.percentageChange.toFixed(1)}% vs 4-week average`;

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6">
      <section className="glass-panel accent-grid overflow-hidden rounded-[32px] px-6 py-7 sm:px-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-sm uppercase tracking-[0.35em] text-[var(--color-accent)]">
              Home
            </p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-[var(--color-text)] sm:text-5xl">
              Your listening week, reduced to the signal that matters.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-[var(--color-muted)]">
              A fast, scannable dashboard for momentum, recent listening, and the tracks and artists shaping the week.
            </p>
          </div>

          <div className="glass-panel rounded-[28px] px-5 py-4">
            <p className="text-xs uppercase tracking-[0.3em] text-[var(--color-muted)]">
              Latest sync
            </p>
            <p className="mt-3 text-sm text-[var(--color-text)]">
              {latestPlayHistoryUpdate
                ? `${formatStatusTime(latestPlayHistoryUpdate.createdAt)}`
                : "No synced plays yet"}
            </p>
            <p className="mt-2 max-w-xs text-sm text-[var(--color-muted)]">
              {latestPlayHistoryUpdate
                ? `${latestPlayHistoryUpdate.trackName} by ${latestPlayHistoryUpdate.artistName}`
                : "Connect and sync Spotify listening history to populate the dashboard."}
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <article className="glass-panel rounded-[30px] p-6 sm:p-7">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-[var(--color-muted)]">
                Listening Momentum
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-[var(--color-text)]">
                Weekly pace and streaks
              </h2>
            </div>
            <div className="rounded-full bg-[rgba(167,139,250,0.12)] px-4 py-2 text-sm font-semibold text-[var(--color-accent)]">
              {momentumDirection}
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="rounded-[24px] border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.03)] p-4">
              <p className="text-xs uppercase tracking-[0.28em] text-[var(--color-muted)]">
                This week
              </p>
              <p className="mt-3 text-4xl font-semibold text-[var(--color-text)]">
                {listeningMomentum.currentWeekPlayCount}
              </p>
              <p className="mt-2 text-sm text-[var(--color-muted)]">
                plays since Monday
              </p>
            </div>
            <div className="rounded-[24px] border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.03)] p-4">
              <p className="text-xs uppercase tracking-[0.28em] text-[var(--color-muted)]">
                4-week average
              </p>
              <p className="mt-3 text-4xl font-semibold text-[var(--color-text)]">
                {listeningMomentum.rollingFourWeekAverage.toFixed(1)}
              </p>
              <p className="mt-2 text-sm text-[var(--color-muted)]">
                average weekly plays
              </p>
            </div>
            <div className="rounded-[24px] border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.03)] p-4">
              <p className="text-xs uppercase tracking-[0.28em] text-[var(--color-muted)]">
                Streak
              </p>
              <p className="mt-3 text-4xl font-semibold text-[var(--color-text)]">
                {listeningMomentum.streakDays}
              </p>
              <p className="mt-2 text-sm text-[var(--color-muted)]">
                consecutive listening days
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_280px]">
            <div className="rounded-[24px] border border-[rgba(255,255,255,0.06)] bg-[linear-gradient(180deg,rgba(167,139,250,0.12),rgba(255,255,255,0.02))] p-4">
              <div className="mb-4 flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-[var(--color-text)]">
                  Last 28 days
                </p>
                <p className="text-xs uppercase tracking-[0.26em] text-[var(--color-muted)]">
                  Daily plays
                </p>
              </div>
              <div className="flex h-32 items-end gap-1.5">
                {listeningMomentum.dailyCounts.map((entry) => {
                  const max = Math.max(
                    ...listeningMomentum.dailyCounts.map((point) => point.count),
                    1
                  );
                  return (
                    <div key={entry.date} className="flex flex-1 items-end">
                      <div
                        title={`${entry.date}: ${entry.count} plays`}
                        className="w-full rounded-t-full bg-[linear-gradient(180deg,rgba(167,139,250,0.95),rgba(167,139,250,0.18))]"
                        style={{
                          height: `${Math.max(10, (entry.count / max) * 100)}%`,
                          opacity: entry.count === 0 ? 0.18 : 1,
                        }}
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="rounded-[24px] border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.03)] p-4">
              <p className="text-xs uppercase tracking-[0.28em] text-[var(--color-muted)]">
                Last played track
              </p>
              {listeningMomentum.lastPlayedTrack ? (
                <div className="mt-4">
                  {listeningMomentum.lastPlayedTrack.albumImage ? (
                    <img
                      src={listeningMomentum.lastPlayedTrack.albumImage}
                      alt={listeningMomentum.lastPlayedTrack.albumName ?? listeningMomentum.lastPlayedTrack.trackName}
                      className="h-36 w-full rounded-[22px] object-cover"
                    />
                  ) : (
                    <div className="flex h-36 items-center justify-center rounded-[22px] bg-[rgba(255,255,255,0.05)] text-4xl text-[var(--color-muted)]">
                      ♪
                    </div>
                  )}
                  <p className="mt-4 truncate text-lg font-semibold text-[var(--color-text)]">
                    {listeningMomentum.lastPlayedTrack.trackName}
                  </p>
                  <p className="truncate text-sm text-[var(--color-muted)]">
                    {listeningMomentum.lastPlayedTrack.artistName}
                  </p>
                  <p className="mt-3 text-xs uppercase tracking-[0.24em] text-[var(--color-muted)]">
                    {formatPlayedAt(listeningMomentum.lastPlayedTrack.playedAt)}
                  </p>
                </div>
              ) : (
                <p className="mt-4 text-sm text-[var(--color-muted)]">No listening data yet.</p>
              )}
            </div>
          </div>
        </article>

        <article className="rounded-[30px] border border-[rgba(255,255,255,0.08)] bg-[linear-gradient(145deg,rgba(167,139,250,0.2),rgba(52,211,153,0.12),rgba(13,13,18,0.9))] p-6 sm:p-7">
          <p className="text-sm uppercase tracking-[0.34em] text-white/80">
            Mini Wrapped
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white">
            Your last 30 days in one snapshot.
          </h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-[24px] bg-[rgba(255,255,255,0.08)] p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-white/60">
                Top artist
              </p>
              <p className="mt-3 text-xl font-semibold text-white">
                {miniWrapped.topArtist?.artistName ?? "No data yet"}
              </p>
              <p className="mt-2 text-sm text-white/70">
                {miniWrapped.topArtist ? `${miniWrapped.topArtist.playCount} plays` : "Start listening to unlock"}
              </p>
            </div>
            <div className="rounded-[24px] bg-[rgba(255,255,255,0.08)] p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-white/60">
                Peak hour
              </p>
              <p className="mt-3 text-xl font-semibold text-white">
                {miniWrapped.peakHour?.label ?? "No data yet"}
              </p>
              <p className="mt-2 text-sm text-white/70">
                {miniWrapped.peakHour ? `${miniWrapped.peakHour.playCount} plays in your hottest slot` : "Listening rhythm pending"}
              </p>
            </div>
            <div className="rounded-[24px] bg-[rgba(255,255,255,0.08)] p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-white/60">
                Top track
              </p>
              <p className="mt-3 text-xl font-semibold text-white">
                {miniWrapped.topTrack?.trackName ?? "No data yet"}
              </p>
              <p className="mt-2 text-sm text-white/70">
                {miniWrapped.topTrack
                  ? `${miniWrapped.topTrack.artistName} • ${miniWrapped.topTrack.playCount} plays`
                  : "Your repeat track will appear here"}
              </p>
            </div>
            <div className="rounded-[24px] bg-[rgba(255,255,255,0.08)] p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-white/60">
                Unique artists
              </p>
              <p className="mt-3 text-xl font-semibold text-white">
                {miniWrapped.uniqueArtistCount}
              </p>
              <p className="mt-2 text-sm text-white/70">
                distinct artists in rotation
              </p>
            </div>
          </div>
        </article>
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <Link
          href="/dashboard/insights"
          className="glass-panel hover-lift block rounded-[30px] p-6 sm:p-7"
        >
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-[var(--color-muted)]">
                Heatmap Teaser
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-[var(--color-text)]">
                Tap into your weekly rhythm
              </h2>
            </div>
            <span className="rounded-full bg-[rgba(167,139,250,0.12)] px-4 py-2 text-sm font-semibold text-[var(--color-accent)]">
              Open Insights
            </span>
          </div>
          <div className="mt-6">
            <HeatmapGrid data={heatmapData} compact />
          </div>
        </Link>

        <article className="glass-panel rounded-[30px] p-6 sm:p-7">
          <div className="mb-5">
            <p className="text-sm uppercase tracking-[0.3em] text-[var(--color-muted)]">
              Recently Played
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-[var(--color-text)]">
              Last 15 tracks
            </h2>
          </div>
          <div className="space-y-3">
            {recentPlays.map((track) => (
              <div
                key={`${track.spotifyTrackId}-${track.playedAt.toISOString()}`}
                className="rounded-[22px] border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.03)] p-4"
              >
                <div className="flex items-center gap-4">
                  {track.albumImage ? (
                    <img
                      src={track.albumImage}
                      alt={track.albumName ?? track.trackName}
                      className="h-14 w-14 rounded-2xl object-cover"
                    />
                  ) : (
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[rgba(255,255,255,0.05)] text-[var(--color-muted)]">
                      ♪
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-[var(--color-text)]">
                      {track.trackName}
                    </p>
                    <p className="truncate text-sm text-[var(--color-muted)]">
                      {track.artistName}
                    </p>
                  </div>
                  <p className="shrink-0 text-right text-sm text-[var(--color-muted)]">
                    {formatPlayedAt(track.playedAt)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <article className="glass-panel rounded-[30px] p-6 sm:p-7">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-[var(--color-muted)]">
                Top Tracks This Week
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-[var(--color-text)]">
                On repeat
              </h2>
            </div>
            <span className="text-sm text-[var(--color-muted)]">{topTracks.length} ranked</span>
          </div>
          <div className="flex snap-x gap-4 overflow-x-auto pb-2">
            {topTracks.map((track) => (
              <div
                key={track.spotifyTrackId}
                className="min-w-[180px] snap-start rounded-[24px] border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.03)] p-4"
              >
                {track.albumImage ? (
                  <img
                    src={track.albumImage}
                    alt={track.albumName ?? track.trackName}
                    className="h-36 w-full rounded-[20px] object-cover"
                  />
                ) : (
                  <div className="flex h-36 items-center justify-center rounded-[20px] bg-[rgba(255,255,255,0.05)] text-3xl text-[var(--color-muted)]">
                    ♪
                  </div>
                )}
                <p className="mt-4 truncate font-semibold text-[var(--color-text)]">
                  {track.trackName}
                </p>
                <p className="truncate text-sm text-[var(--color-muted)]">
                  {track.artistName}
                </p>
                <p className="mt-3 text-sm font-semibold text-[var(--color-accent)]">
                  {track._count.spotifyTrackId} plays
                </p>
              </div>
            ))}
          </div>
        </article>

        <article className="glass-panel rounded-[30px] p-6 sm:p-7">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-[var(--color-muted)]">
                Top Artists This Week
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-[var(--color-text)]">
                Dominant voices
              </h2>
            </div>
            <span className="text-sm text-[var(--color-muted)]">{topArtists.length} ranked</span>
          </div>
          <div className="flex snap-x gap-4 overflow-x-auto pb-2">
            {topArtists.map((artist, index) => (
              <div
                key={artist.artistName}
                className="min-w-[180px] snap-start rounded-[24px] border border-[rgba(255,255,255,0.06)] bg-[linear-gradient(180deg,rgba(52,211,153,0.14),rgba(255,255,255,0.02))] p-5"
              >
                <p className="text-xs uppercase tracking-[0.28em] text-[var(--color-secondary)]">
                  #{String(index + 1).padStart(2, "0")}
                </p>
                <p className="mt-6 text-xl font-semibold text-[var(--color-text)]">
                  {artist.artistName}
                </p>
                <p className="mt-3 text-sm text-[var(--color-muted)]">
                  Weekly share of attention
                </p>
                <p className="mt-6 text-3xl font-semibold text-[var(--color-text)]">
                  {artist._count.artistName}
                </p>
                <p className="text-sm text-[var(--color-secondary)]">plays</p>
              </div>
            ))}
          </div>
        </article>
      </section>
    </div>
  );
}
