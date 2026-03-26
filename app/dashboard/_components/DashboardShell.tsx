"use client";

/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { CSSProperties } from "react";
import { useState } from "react";
import { CursorGlow } from "@/app/components/CursorGlow";

type DashboardShellProps = {
  children: React.ReactNode;
  user: {
    displayName?: string | null;
    imageUrl?: string | null;
  };
};

type NavItem = {
  href: string;
  label: string;
  shortLabel: string;
  icon: React.ReactNode;
};

const navItems: NavItem[] = [
  {
    href: "/dashboard",
    label: "Home",
    shortLabel: "Home",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current stroke-[1.8]">
        <path d="M3 10.5 12 3l9 7.5" />
        <path d="M5.5 9.5V21h13V9.5" />
      </svg>
    ),
  },
  {
    href: "/dashboard/insights",
    label: "Insights",
    shortLabel: "Insights",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current stroke-[1.8]">
        <path d="M4 19V9" />
        <path d="M10 19V5" />
        <path d="M16 19v-7" />
        <path d="M22 19V3" />
      </svg>
    ),
  },
  {
    href: "/dashboard/discover",
    label: "Discover",
    shortLabel: "Discover",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current stroke-[1.8]">
        <circle cx="12" cy="12" r="8.5" />
        <path d="m15.5 8.5-2.4 6.1-6.1 2.4 2.4-6.1 6.1-2.4Z" />
      </svg>
    ),
  },
  {
    href: "/dashboard/settings",
    label: "Settings",
    shortLabel: "Settings",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current stroke-[1.8]">
        <circle cx="12" cy="12" r="3.2" />
        <path d="M19.4 15a1 1 0 0 0 .2 1.1l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1 1 0 0 0-1.1-.2 1 1 0 0 0-.6.9V20a2 2 0 1 1-4 0v-.2a1 1 0 0 0-.7-.9 1 1 0 0 0-1 .2l-.2.1a2 2 0 1 1-2.8-2.8l.1-.1a1 1 0 0 0 .2-1.1 1 1 0 0 0-.9-.6H4a2 2 0 1 1 0-4h.2a1 1 0 0 0 .9-.7 1 1 0 0 0-.2-1l-.1-.2a2 2 0 1 1 2.8-2.8l.1.1a1 1 0 0 0 1.1.2 1 1 0 0 0 .6-.9V4a2 2 0 1 1 4 0v.2a1 1 0 0 0 .7.9 1 1 0 0 0 1-.2l.2-.1a2 2 0 1 1 2.8 2.8l-.1.1a1 1 0 0 0-.2 1.1 1 1 0 0 0 .9.6h.2a2 2 0 1 1 0 4h-.2a1 1 0 0 0-.9.7Z" />
      </svg>
    ),
  },
];

function isActivePath(pathname: string, href: string) {
  return href === "/dashboard" ? pathname === href : pathname.startsWith(href);
}

export function DashboardShell({ children, user }: DashboardShellProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="relative z-20 min-h-screen">
      <CursorGlow />

      <aside
        className="fixed left-0 top-0 z-30 hidden h-screen border-r border-[var(--color-border)] bg-[rgba(13,13,18,0.76)] px-4 py-6 backdrop-blur-xl md:flex md:flex-col"
        style={{ width: collapsed ? 96 : 288 }}
      >
        <div className="flex items-center justify-between gap-3">
          {!collapsed ? (
            <div>
              <p className="text-xs uppercase tracking-[0.38em] text-[var(--color-accent)]">
                Pulseform
              </p>
              <p className="mt-2 text-sm text-[var(--color-muted)]">
                Listening dashboard
              </p>
            </div>
          ) : (
            <div className="mx-auto rounded-2xl border border-[rgba(255,255,255,0.08)] px-3 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-[var(--color-accent)]">
              P
            </div>
          )}

          <button
            type="button"
            onClick={() => setCollapsed((value) => !value)}
            className="rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] p-2 text-[var(--color-muted)] transition hover:text-[var(--color-text)]"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current stroke-[1.8]">
              {collapsed ? (
                <path d="m9 6 6 6-6 6" />
              ) : (
                <path d="m15 6-6 6 6 6" />
              )}
            </svg>
          </button>
        </div>

        <nav className="mt-8 flex flex-1 flex-col gap-2">
          {navItems.map((item) => {
            const active = isActivePath(pathname, item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group relative flex items-center gap-3 overflow-hidden rounded-2xl border px-3 py-3 text-sm font-medium transition ${
                  active
                    ? "border-[rgba(167,139,250,0.35)] bg-[rgba(167,139,250,0.14)] text-[var(--color-text)]"
                    : "border-transparent text-[var(--color-muted)] hover:border-[rgba(255,255,255,0.06)] hover:bg-[rgba(255,255,255,0.03)] hover:text-[var(--color-text)]"
                }`}
              >
                <span
                  className={`absolute left-0 top-2 bottom-2 w-1 rounded-full ${
                    active ? "bg-[var(--color-accent)]" : "bg-transparent"
                  }`}
                />
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[rgba(255,255,255,0.04)]">
                  {item.icon}
                </span>
                {!collapsed ? (
                  <div className="min-w-0">
                    <p>{item.label}</p>
                    <p className="text-xs text-[var(--color-muted)]">
                      {item.href === "/dashboard"
                        ? "Daily driver"
                        : item.href === "/dashboard/insights"
                          ? "Deep analytics"
                          : item.href === "/dashboard/discover"
                            ? "Playlist builder"
                            : "Account controls"}
                    </p>
                  </div>
                ) : null}
              </Link>
            );
          })}
        </nav>

        <div className="glass-panel rounded-3xl px-4 py-4">
          <div className="flex items-center gap-3">
            {user.imageUrl ? (
              <img
                src={user.imageUrl}
                alt={user.displayName ?? "Spotify user"}
                className="h-11 w-11 rounded-2xl object-cover"
              />
            ) : (
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[rgba(255,255,255,0.06)] text-sm font-semibold text-[var(--color-accent)]">
                {(user.displayName ?? "SP").slice(0, 2).toUpperCase()}
              </div>
            )}
            {!collapsed ? (
              <div className="min-w-0">
                <p className="truncate font-semibold text-[var(--color-text)]">
                  {user.displayName ?? "Spotify listener"}
                </p>
                <p className="truncate text-sm text-[var(--color-muted)]">
                  Authenticated session
                </p>
              </div>
            ) : null}
          </div>
        </div>
      </aside>

      <div
        className="min-h-screen md:pl-[var(--sidebar-width)]"
        style={
          {
            ["--sidebar-width" as string]: `${collapsed ? 96 : 288}px`,
          } as CSSProperties
        }
      >
        <main className="min-h-screen px-4 py-6 pb-28 sm:px-6 lg:px-8 md:pb-8">
          {children}
        </main>
      </div>

      <nav className="fixed inset-x-4 bottom-4 z-40 md:hidden">
        <div className="glass-panel grid grid-cols-4 rounded-[28px] p-2">
          {navItems.map((item) => {
            const active = isActivePath(pathname, item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-1 rounded-[20px] px-2 py-3 text-xs font-medium transition ${
                  active
                    ? "bg-[rgba(167,139,250,0.16)] text-[var(--color-text)]"
                    : "text-[var(--color-muted)]"
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.shortLabel}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
