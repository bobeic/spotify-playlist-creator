"use client";

import React from "react";
import { CursorGlow } from "@/app/components/CursorGlow";

export default function LoginPage() {
  return (
    <main className="relative z-20 flex min-h-[calc(100vh-73px)] items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
      <CursorGlow />
      <div className="glass-panel accent-grid w-full max-w-3xl overflow-hidden rounded-[32px] p-8 text-center sm:p-12">
        <p className="mb-4 text-sm uppercase tracking-[0.4em] text-[var(--color-accent)]">
          Spotify Playlist Generator
        </p>
        <h1 className="mx-auto max-w-2xl text-4xl font-semibold tracking-tight text-[var(--color-text)] sm:text-5xl">
          Build playlists from artist signals in a darker, richer workspace.
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-[var(--color-muted)]">
          Discover artists, preview tracks, and assemble playlists with a premium music analytics aesthetic that keeps the interface immersive without losing clarity.
        </p>
        <a
          href="/api/auth/login"
          className="mt-8 inline-flex items-center justify-center rounded-full border border-[rgba(255,255,255,0.08)] bg-[var(--color-accent)] px-6 py-3 font-semibold text-[#0D0D12] transition-all duration-200 ease-out hover:-translate-y-0.5 hover:bg-[#b39afb] hover:shadow-[0_12px_32px_rgba(167,139,250,0.28)]"
        >
          Login with Spotify
        </a>
        <p className="mx-auto mt-6 max-w-lg text-sm leading-6 text-[var(--color-muted)]">
          By logging in, you authorize this app to access your Spotify account to create playlists and view your top tracks.
        </p>
      </div>
    </main>
  );
}
