"use client";

/* eslint-disable @next/next/no-img-element */

import { useEffect, useState } from "react";
import { CursorGlow } from "@/app/components/CursorGlow";

type TrackGroup = {
  spotifyTrackId: string;
  trackName: string;
  artistName: string;
  albumName: string;
  albumImage: string | null;
  _count: {
    spotifyTrackId: number;
  };
};

type ArtistGroup = {
  artistName: string;
  _count: {
    artistName: number;
  };
};

type PlayHistoryTrack = {
  spotifyTrackId: string;
  trackName: string;
  artistName: string;
  albumName: string;
  albumImage: string | null;
  playedAt: string;
};

type DashboardData = {
  topTracks: TrackGroup[];
  topArtists: ArtistGroup[];
  newTracks: PlayHistoryTrack[];
  recentPlays: PlayHistoryTrack[];
};

function formatPlayedAt(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    day: "numeric",
    month: "short",
  }).format(new Date(value));
}

function getStatCards(data: DashboardData) {
  const totalTopTrackPlays = data.topTracks.reduce(
    (sum, track) => sum + track._count.spotifyTrackId,
    0
  );
  const totalTopArtistPlays = data.topArtists.reduce(
    (sum, artist) => sum + artist._count.artistName,
    0
  );

  return [
    {
      label: "Top Track Plays",
      value: totalTopTrackPlays,
      trend: data.topTracks[0]
        ? `${data.topTracks[0]._count.spotifyTrackId} spins from your top track`
        : "No data yet",
      icon: "♫",
      accent: "violet",
    },
    {
      label: "Top Artist Sessions",
      value: totalTopArtistPlays,
      trend: data.topArtists[0]
        ? `${data.topArtists[0].artistName} leads this week`
        : "No data yet",
      icon: "◌",
      accent: "violet",
    },
    {
      label: "New Discoveries",
      value: data.newTracks.length,
      trend: data.newTracks[0]
        ? `${data.newTracks[0].trackName} arrived most recently`
        : "Nothing new this week",
      icon: "✦",
      accent: "emerald",
    },
    {
      label: "Recent Sessions",
      value: data.recentPlays.length,
      trend: data.recentPlays[0]
        ? `${data.recentPlays[0].artistName} was last in rotation`
        : "No recent plays",
      icon: "◷",
      accent: "emerald",
    },
  ];
}

export default function Home() {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboard() {
      const res = await fetch("/api/dashboard");
      if (res.ok) {
        const data = await res.json();
        setDashboard(data);
      }
      setLoading(false);
    }

    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <main className="relative z-20 min-h-[calc(100vh-73px)] px-4 py-10 sm:px-6 lg:px-8">
        <CursorGlow />
        <div className="mx-auto flex max-w-6xl items-center justify-center">
          <div className="glass-panel w-full max-w-xl rounded-[28px] px-8 py-16 text-center">
            <div className="mx-auto mb-6 h-12 w-12 animate-pulse rounded-full bg-[rgba(167,139,250,0.2)] shadow-[0_0_40px_rgba(167,139,250,0.2)]" />
            <p className="text-sm uppercase tracking-[0.3em] text-[var(--color-muted)]">
              Syncing your listening signal
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (!dashboard) {
    return (
      <main className="relative z-20 flex min-h-[calc(100vh-73px)] flex-col items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
        <CursorGlow />
        <div className="glass-panel accent-grid w-full max-w-2xl rounded-[32px] px-8 py-14 text-center">
          <p className="mb-4 text-sm uppercase tracking-[0.4em] text-[var(--color-accent)]">
            Premium listening analytics
          </p>
          <h1 className="mb-4 text-4xl font-semibold tracking-tight text-[var(--color-text)] sm:text-5xl">
            Your Spotify story, rendered in motion.
          </h1>
          <p className="mx-auto mb-8 max-w-xl text-base leading-7 text-[var(--color-muted)]">
            Connect Spotify to unlock a dark, immersive dashboard for your weekly habits, discoveries, and listening streaks.
          </p>
          <a
            href="/api/auth/login"
            className="inline-flex items-center justify-center rounded-full border border-[rgba(255,255,255,0.08)] bg-[var(--color-accent)] px-6 py-3 text-sm font-semibold text-[#0D0D12] transition-all duration-200 ease-out hover:-translate-y-0.5 hover:bg-[#b39afb] hover:shadow-[0_12px_32px_rgba(167,139,250,0.28)]"
          >
            Login with Spotify
          </a>
        </div>
      </main>
    );
  }

  const statCards = getStatCards(dashboard);
  const maxTrackCount = Math.max(
    ...dashboard.topTracks.map((track) => track._count.spotifyTrackId),
    1
  );
  const maxArtistCount = Math.max(
    ...dashboard.topArtists.map((artist) => artist._count.artistName),
    1
  );

  return (
    <main className="relative z-20 min-h-[calc(100vh-73px)] px-4 py-8 sm:px-6 lg:px-8">
      <CursorGlow />
      <div className="mx-auto flex max-w-7xl flex-col gap-8">
        <section className="glass-panel accent-grid overflow-hidden rounded-[32px] px-6 py-8 sm:px-8 lg:px-10">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="mb-3 text-sm uppercase tracking-[0.35em] text-[var(--color-accent)]">
                Spotify Listening Dashboard
              </p>
              <h1 className="text-4xl font-semibold tracking-tight text-[var(--color-text)] sm:text-5xl lg:text-6xl">
                Measure the mood, rhythm, and momentum of your week.
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-[var(--color-muted)] sm:text-lg">
                A premium snapshot of what has been on repeat lately, what is newly emerging, and which artists are defining your listening sessions.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="glass-panel hover-lift rounded-3xl px-5 py-4">
                <p className="text-xs uppercase tracking-[0.3em] text-[var(--color-muted)]">
                  Weekly pulse
                </p>
                <p className="mt-3 text-3xl font-semibold text-[var(--color-text)]">
                  {dashboard.topTracks.length}
                </p>
                <p className="mt-2 text-sm text-[var(--color-muted)]">
                  Ranked tracks surfaced this week
                </p>
              </div>
              <div className="glass-panel glass-panel-emerald hover-lift rounded-3xl px-5 py-4">
                <p className="text-xs uppercase tracking-[0.3em] text-[var(--color-muted)]">
                  Discovery flow
                </p>
                <p className="mt-3 text-3xl font-semibold text-[var(--color-text)]">
                  {dashboard.newTracks.length}
                </p>
                <p className="mt-2 text-sm text-[var(--color-muted)]">
                  Fresh tracks added to your orbit
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {statCards.map((card) => {
            const isEmerald = card.accent === "emerald";

            return (
              <article
                key={card.label}
                className={`glass-panel hover-lift rounded-[28px] px-6 py-5 ${
                  isEmerald ? "glass-panel-emerald" : ""
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-[var(--color-muted)]">
                      {card.label}
                    </p>
                    <p className="mt-4 text-4xl font-semibold tracking-tight text-[var(--color-text)]">
                      {card.value}
                    </p>
                  </div>
                  <div
                    className={`flex h-11 w-11 items-center justify-center rounded-2xl border border-[rgba(255,255,255,0.06)] text-lg ${
                      isEmerald
                        ? "bg-[rgba(52,211,153,0.09)] text-[var(--color-secondary)]"
                        : "bg-[rgba(167,139,250,0.09)] text-[var(--color-accent)]"
                    }`}
                  >
                    {card.icon}
                  </div>
                </div>
                <p
                  className={`mt-5 text-sm ${
                    isEmerald
                      ? "text-[var(--color-secondary)]"
                      : "text-[var(--color-accent)]"
                  }`}
                >
                  {card.trend}
                </p>
              </article>
            );
          })}
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-6">
            <article className="glass-panel rounded-[30px] p-6 sm:p-7">
              <div className="mb-6">
                <p className="text-sm uppercase tracking-[0.3em] text-[var(--color-muted)]">
                  Top Tracks This Week
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-[var(--color-text)]">
                  What stayed on repeat
                </h2>
              </div>
              <div className="space-y-4">
                {dashboard.topTracks.map((track, index) => {
                  const width = `${
                    (track._count.spotifyTrackId / maxTrackCount) * 100
                  }%`;

                  return (
                    <div
                      key={track.spotifyTrackId}
                      className="glass-panel hover-lift rounded-[24px] p-4"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[rgba(167,139,250,0.1)] text-sm font-semibold text-[var(--color-accent)]">
                          {String(index + 1).padStart(2, "0")}
                        </div>
                        {track.albumImage ? (
                          <img
                            src={track.albumImage}
                            alt={track.albumName}
                            className="h-16 w-16 rounded-2xl object-cover"
                          />
                        ) : (
                          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[rgba(255,255,255,0.05)] text-xl text-[var(--color-muted)]">
                            ♪
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-lg font-semibold text-[var(--color-text)]">
                            {track.trackName}
                          </p>
                          <p className="truncate text-sm text-[var(--color-muted)]">
                            {track.artistName}
                          </p>
                          <div className="mt-4 h-2 overflow-hidden rounded-full bg-[rgba(255,255,255,0.04)]">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-[rgba(167,139,250,0.95)] to-[rgba(167,139,250,0.18)]"
                              style={{ width }}
                            />
                          </div>
                        </div>
                        <div className="shrink-0 text-right">
                          <p className="text-2xl font-semibold text-[var(--color-text)]">
                            {track._count.spotifyTrackId}
                          </p>
                          <p className="text-xs uppercase tracking-[0.22em] text-[var(--color-muted)]">
                            plays
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </article>

            <article className="glass-panel rounded-[30px] p-6 sm:p-7">
              <div className="mb-6">
                <p className="text-sm uppercase tracking-[0.3em] text-[var(--color-muted)]">
                  Recently Played
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-[var(--color-text)]">
                  Latest listening activity
                </h2>
              </div>
              <div className="space-y-3">
                {dashboard.recentPlays.map((track) => (
                  <div
                    key={`${track.spotifyTrackId}-${track.playedAt}`}
                    className="glass-panel hover-lift group rounded-[22px] border-l border-l-transparent p-4 transition-all duration-200 ease-out hover:border-l-[var(--color-accent)]"
                  >
                    <div className="flex items-center gap-4">
                      {track.albumImage ? (
                        <img
                          src={track.albumImage}
                          alt={track.albumName}
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
          </div>

          <div className="space-y-6">
            <article className="glass-panel rounded-[30px] p-6 sm:p-7">
              <div className="mb-6">
                <p className="text-sm uppercase tracking-[0.3em] text-[var(--color-muted)]">
                  Top Artists This Week
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-[var(--color-text)]">
                  Your dominant voices
                </h2>
              </div>
              <div className="space-y-4">
                {dashboard.topArtists.map((artist, index) => {
                  const width = `${
                    (artist._count.artistName / maxArtistCount) * 100
                  }%`;

                  return (
                    <div
                      key={artist.artistName}
                      className="rounded-[24px] border border-[rgba(255,255,255,0.05)] bg-[linear-gradient(180deg,rgba(30,30,46,0.62),rgba(19,19,26,0.78))] p-4"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-semibold text-[var(--color-accent)]">
                              {String(index + 1).padStart(2, "0")}
                            </span>
                            <p className="truncate text-base font-semibold text-[var(--color-text)]">
                              {artist.artistName}
                            </p>
                          </div>
                          <div className="mt-4 h-24 overflow-hidden rounded-[20px] bg-[linear-gradient(180deg,rgba(167,139,250,0.18),rgba(167,139,250,0.02))] p-4">
                            <div
                              className="h-full rounded-[16px] bg-gradient-to-t from-[rgba(167,139,250,0.65)] to-[rgba(167,139,250,0)]"
                              style={{ width }}
                            />
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-3xl font-semibold text-[var(--color-text)]">
                            {artist._count.artistName}
                          </p>
                          <p className="text-xs uppercase tracking-[0.22em] text-[var(--color-muted)]">
                            plays
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </article>

            <article className="glass-panel glass-panel-emerald rounded-[30px] p-6 sm:p-7">
              <div className="mb-6">
                <p className="text-sm uppercase tracking-[0.3em] text-[var(--color-muted)]">
                  New Tracks This Week
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-[var(--color-text)]">
                  Fresh arrivals
                </h2>
              </div>
              <div className="space-y-3">
                {dashboard.newTracks.map((track) => (
                  <div
                    key={`${track.spotifyTrackId}-${track.playedAt}`}
                    className="rounded-[22px] border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.03)] p-4"
                  >
                    <div className="flex items-center gap-4">
                      {track.albumImage ? (
                        <img
                          src={track.albumImage}
                          alt={track.albumName}
                          className="h-14 w-14 rounded-2xl object-cover"
                        />
                      ) : (
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[rgba(52,211,153,0.08)] text-[var(--color-secondary)]">
                          ✦
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
                      <p className="text-xs uppercase tracking-[0.22em] text-[var(--color-secondary)]">
                        New
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </article>
          </div>
        </section>
      </div>
    </main>
  );
}
