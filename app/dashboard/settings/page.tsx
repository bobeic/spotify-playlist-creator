import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { getLatestPlayHistoryUpdate } from "@/lib/dashboard/queries";

function formatDateTime(value: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(value);
}

export default async function DashboardSettingsPage() {
  const user = await getCurrentUser();

  if (!user) {
    return null;
  }

  const latestPlayHistoryUpdate = await getLatestPlayHistoryUpdate(user.id);

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      <section className="glass-panel accent-grid overflow-hidden rounded-[32px] px-6 py-7 sm:px-8">
        <p className="text-sm uppercase tracking-[0.35em] text-[var(--color-accent)]">
          Settings
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-[var(--color-text)] sm:text-5xl">
          Account connection and sync status.
        </h1>
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        <article className="glass-panel rounded-[30px] p-6 sm:p-7">
          <p className="text-sm uppercase tracking-[0.3em] text-[var(--color-muted)]">
            Spotify connection
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-[var(--color-text)]">
            {user.spotifyAccount ? "Connected" : "Disconnected"}
          </h2>
          <p className="mt-4 text-sm leading-6 text-[var(--color-muted)]">
            {user.spotifyAccount
              ? `Signed in as ${user.displayName ?? user.email ?? "your Spotify account"}.`
              : "Spotify is not currently connected for this account."}
          </p>
        </article>

        <article className="glass-panel rounded-[30px] p-6 sm:p-7">
          <p className="text-sm uppercase tracking-[0.3em] text-[var(--color-muted)]">
            Last data sync
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-[var(--color-text)]">
            {latestPlayHistoryUpdate
              ? formatDateTime(latestPlayHistoryUpdate.createdAt)
              : "No sync recorded"}
          </h2>
          <p className="mt-4 text-sm leading-6 text-[var(--color-muted)]">
            {latestPlayHistoryUpdate
              ? `${latestPlayHistoryUpdate.trackName} by ${latestPlayHistoryUpdate.artistName} was the most recent stored play.`
              : "Once the cron sync runs and stores listening history, it will show up here."}
          </p>
        </article>
      </section>

      <section className="glass-panel rounded-[30px] p-6 sm:p-7">
        <p className="text-sm uppercase tracking-[0.3em] text-[var(--color-muted)]">
          Session
        </p>
        <h2 className="mt-2 text-2xl font-semibold text-[var(--color-text)]">
          Sign out
        </h2>
        <p className="mt-4 max-w-2xl text-sm leading-6 text-[var(--color-muted)]">
          End the current session on this device. Your synced play history stays in the database.
        </p>
        <form action="/api/auth/logout" method="post" className="mt-6">
          <button
            type="submit"
            className="rounded-full bg-[var(--color-secondary)] px-5 py-3 text-sm font-semibold text-[#0D0D12] transition-all duration-200 ease-out hover:-translate-y-0.5 hover:bg-[#48dca7] hover:shadow-[0_12px_32px_rgba(52,211,153,0.24)]"
          >
            Sign out
          </button>
        </form>
      </section>
    </div>
  );
}
