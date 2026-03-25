import Link from "next/link";
import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] antialiased">
        <div className="app-shell">
          <div className="aurora aurora-violet" />
          <div className="aurora aurora-emerald" />
          <nav className="sticky top-0 z-40 border-b border-[var(--color-border)] bg-[rgba(13,13,18,0.72)] backdrop-blur-xl">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
              <Link
                href="/"
                className="text-sm font-semibold uppercase tracking-[0.3em] text-[var(--color-text)] transition-colors duration-200 ease-out hover:text-[var(--color-accent)]"
              >
                Pulseform
              </Link>
              <div className="flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-[rgba(255,255,255,0.04)] p-1 backdrop-blur-xl">
                <Link
                  href="/"
                  className="rounded-full px-4 py-2 text-sm text-[var(--color-muted)] transition-all duration-200 ease-out hover:bg-[rgba(255,255,255,0.05)] hover:text-[var(--color-text)]"
                >
                  Dashboard
                </Link>
                <Link
                  href="/playlists"
                  className="rounded-full px-4 py-2 text-sm text-[var(--color-muted)] transition-all duration-200 ease-out hover:bg-[rgba(255,255,255,0.05)] hover:text-[var(--color-text)]"
                >
                  Playlists
                </Link>
              </div>
            </div>
          </nav>

          {children}
        </div>
      </body>
    </html>
  );
}
