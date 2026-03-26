/* eslint-disable @next/next/no-img-element */

import { HeatmapGrid } from "@/app/dashboard/_components/HeatmapGrid";
import { DiscoveryRateChart } from "@/app/dashboard/_components/DiscoveryRateChart";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import {
  getArtistLoyalty,
  getDiscoveryRate,
  getHeatmapData,
  getNewTracksThisWeek,
} from "@/lib/dashboard/queries";

function formatPlayedAt(value: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    day: "numeric",
    month: "short",
  }).format(value);
}

export default async function DashboardInsightsPage() {
  const user = await getCurrentUser();

  if (!user) {
    return null;
  }

  const [heatmapData, discoveryRate, artistLoyalty, newTracks] = await Promise.all([
    getHeatmapData(user.id),
    getDiscoveryRate(user.id),
    getArtistLoyalty(user.id),
    getNewTracksThisWeek(user.id),
  ]);

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6">
      <section className="glass-panel accent-grid overflow-hidden rounded-[32px] px-6 py-7 sm:px-8">
        <p className="text-sm uppercase tracking-[0.35em] text-[var(--color-accent)]">
          Insights
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-[var(--color-text)] sm:text-5xl">
          Deeper patterns in timing, discovery, and artist loyalty.
        </h1>
        <p className="mt-4 max-w-3xl text-base leading-7 text-[var(--color-muted)]">
          Explore when you listen, how often you discover something new, and which artists are earning an outsized share of your all-time rotation.
        </p>
      </section>

      <section className="glass-panel rounded-[30px] p-6 sm:p-7">
        <div className="mb-6">
          <p className="text-sm uppercase tracking-[0.3em] text-[var(--color-muted)]">
            Listening Heatmap
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-[var(--color-text)]">
            Weekly pattern by day and hour
          </h2>
        </div>
        <HeatmapGrid data={heatmapData} />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <article className="glass-panel rounded-[30px] p-6 sm:p-7">
          <DiscoveryRateChart data={discoveryRate} />
        </article>

        <article className="glass-panel glass-panel-emerald rounded-[30px] p-6 sm:p-7">
          <div className="mb-5">
            <p className="text-sm uppercase tracking-[0.3em] text-[var(--color-muted)]">
              New Tracks This Week
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-[var(--color-text)]">
              First-time plays landing now
            </h2>
          </div>
          <div className="space-y-3">
            {newTracks.map((track) => (
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
                  <p className="shrink-0 text-right text-sm text-[var(--color-muted)]">
                    {formatPlayedAt(track.playedAt)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="glass-panel rounded-[30px] p-6 sm:p-7">
        <div className="mb-6">
          <p className="text-sm uppercase tracking-[0.3em] text-[var(--color-muted)]">
            Artist Loyalty Breakdown
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-[var(--color-text)]">
            Artists commanding your all-time share
          </h2>
        </div>
        <div className="space-y-3">
          {artistLoyalty.map((artist, index) => {
            const trendColor =
              artist.trend === "up"
                ? "text-[var(--color-secondary)]"
                : artist.trend === "down"
                  ? "text-rose-300"
                  : "text-[var(--color-muted)]";

            return (
              <div
                key={artist.artistName}
                className="rounded-[24px] border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.03)] p-4"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold text-[var(--color-accent)]">
                        #{String(index + 1).padStart(2, "0")}
                      </span>
                      <p className="truncate text-lg font-semibold text-[var(--color-text)]">
                        {artist.artistName}
                      </p>
                    </div>
                    <div className="mt-4 h-2 overflow-hidden rounded-full bg-[rgba(255,255,255,0.05)]">
                      <div
                        className="h-full rounded-full bg-[linear-gradient(90deg,rgba(167,139,250,0.95),rgba(52,211,153,0.72))]"
                        style={{
                          width: `${Math.max(8, Math.min(100, artist.sharePercentage))}%`,
                        }}
                      />
                    </div>
                  </div>
                  <div className="grid gap-2 text-sm text-[var(--color-muted)] sm:grid-cols-3 sm:text-right">
                    <div>
                      <p className="text-xs uppercase tracking-[0.26em]">All-time</p>
                      <p className="mt-2 text-lg font-semibold text-[var(--color-text)]">
                        {artist.totalPlays}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.26em]">Share</p>
                      <p className="mt-2 text-lg font-semibold text-[var(--color-text)]">
                        {artist.sharePercentage.toFixed(1)}%
                      </p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.26em]">WoW trend</p>
                      <p className={`mt-2 text-lg font-semibold ${trendColor}`}>
                        {artist.trend === "up"
                          ? `Up ${artist.currentWeekPlays}-${artist.previousWeekPlays}`
                          : artist.trend === "down"
                            ? `Down ${artist.currentWeekPlays}-${artist.previousWeekPlays}`
                            : `Flat ${artist.currentWeekPlays}-${artist.previousWeekPlays}`}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
