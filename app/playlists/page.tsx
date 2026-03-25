"use client";

/* eslint-disable @next/next/no-img-element */

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CursorGlow } from "@/app/components/CursorGlow";

type Artist = {
  id: string;
  name: string;
  images: { url: string }[];
  followers: { total: number };
};

type SpotifyArtist = {
  name: string;
};

type SpotifyTrack = {
  id: string;
  name: string;
  uri: string;
  preview_url: string | null;
  album: {
    images: { url: string }[];
    name: string;
  };
  artists: SpotifyArtist[];
};

type Playlist = {
  id: string;
  name: string;
};

type PreviewState = {
  url?: string | null;
  loading: boolean;
};

export default function PlaylistsPage() {
  const router = useRouter();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Artist[]>([]);
  const [selectedArtists, setSelectedArtists] = useState<Artist[]>([]);
  const [playlistDraft, setPlaylistDraft] = useState<SpotifyTrack[]>([]);
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string | null>(
    null
  );
  const [loadingPlaylists, setLoadingPlaylists] = useState(false);
  const [previews, setPreviews] = useState<Record<string, PreviewState>>({});
  const [artistTracks, setArtistTracks] = useState<Record<string, SpotifyTrack[]>>(
    {}
  );

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch("/api/auth/me");
        if (!res.ok) {
          router.push("/login");
          return;
        }
      } catch (err) {
        console.error("Auth check failed:", err);
        router.push("/login");
        return;
      }

      setLoading(false);
    };

    checkAuth();
  }, [router]);

  useEffect(() => {
    const trimmedQuery = query.trim();
    if (!trimmedQuery) {
      return;
    }

    const timeout = window.setTimeout(async () => {
      const res = await fetch(
        `/api/spotify/search-artists?q=${encodeURIComponent(trimmedQuery)}`
      );
      const data: Artist[] = await res.json();
      setSuggestions(data);
    }, 400);

    return () => window.clearTimeout(timeout);
  }, [query]);

  useEffect(() => {
    audioRef.current = new Audio();
    audioRef.current.volume = 0.5;

    return () => {
      audioRef.current?.pause();
      audioRef.current = null;
    };
  }, []);

  const playPreview = async (url: string) => {
    if (!url || !audioRef.current) {
      return;
    }

    const audio = audioRef.current;

    if (audio.src === url && !audio.paused) {
      audio.pause();
      audio.currentTime = 0;
      return;
    }

    audio.pause();
    audio.currentTime = 0;
    audio.src = url;
    audio.load();

    try {
      await audio.play();
    } catch (err) {
      console.error("Audio play failed:", err);
    }
  };

  const handlePreviewClick = async (track: SpotifyTrack) => {
    const state = previews[track.id];
    if (state?.url) {
      playPreview(state.url);
      return;
    }

    if (state?.loading) {
      return;
    }

    setPreviews((current) => ({
      ...current,
      [track.id]: { loading: true },
    }));

    const res = await fetch(
      `/api/deezer/preview?track=${encodeURIComponent(
        track.name
      )}&artist=${encodeURIComponent(track.artists[0]?.name ?? "")}`
    );
    const data: { preview?: string | null } = await res.json();

    setPreviews((current) => ({
      ...current,
      [track.id]: { url: data.preview ?? null, loading: false },
    }));

    if (data.preview) {
      playPreview(data.preview);
    }
  };

  const addToPlaylist = (track: SpotifyTrack) => {
    setPlaylistDraft((current) =>
      current.find((item) => item.id === track.id) ? current : [...current, track]
    );
  };

  const removeFromPlaylist = (trackId: string) => {
    setPlaylistDraft((current) => current.filter((track) => track.id !== trackId));
  };

  const fetchTopTracks = async (artistId: string) => {
    const res = await fetch(`/api/spotify/artist-top-tracks?artistId=${artistId}`);
    const data: SpotifyTrack[] = await res.json();
    setArtistTracks((current) => ({ ...current, [artistId]: data }));
  };

  const selectArtist = (artist: Artist) => {
    if (!selectedArtists.find((entry) => entry.id === artist.id)) {
      setSelectedArtists((current) => [...current, artist]);
      fetchTopTracks(artist.id);
    }

    setQuery("");
    setSuggestions([]);
  };

  const createSpotifyPlaylist = async () => {
    if (playlistDraft.length === 0) {
      alert("Add some tracks first!");
      return;
    }

    const trackUris = playlistDraft.map((track) => track.uri);
    const name = prompt("Enter playlist name") || "My Next.js Playlist";

    const res = await fetch("/api/spotify/create-playlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, trackUris }),
    });
    const data = await res.json();

    if (res.ok) {
      alert(`Playlist "${data.playlist.name}" created successfully!`);
      setPlaylistDraft([]);
      return;
    }

    alert(`Error creating playlist: ${data.error}`);
  };

  const openAddToPlaylistModal = async () => {
    setShowPlaylistModal(true);

    if (playlists.length > 0) {
      return;
    }

    setLoadingPlaylists(true);
    const res = await fetch("/api/spotify/user-playlists");
    const data: Playlist[] = await res.json();
    setPlaylists(data);
    setLoadingPlaylists(false);
  };

  const addToExistingPlaylist = async () => {
    if (!selectedPlaylistId || playlistDraft.length === 0) {
      return;
    }

    const trackUris = playlistDraft.map((track) => track.uri);

    const res = await fetch("/api/spotify/add-to-playlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        playlistId: selectedPlaylistId,
        trackUris,
      }),
    });

    if (res.ok) {
      alert("Tracks added to playlist!");
      setPlaylistDraft([]);
      setShowPlaylistModal(false);
      return;
    }

    alert("Failed to add tracks");
  };

  if (loading) {
    return (
      <main className="relative z-20 min-h-[calc(100vh-73px)] px-4 py-10 sm:px-6 lg:px-8">
        <CursorGlow />
        <div className="mx-auto flex max-w-4xl items-center justify-center">
          <div className="glass-panel w-full max-w-xl rounded-[28px] px-8 py-16 text-center">
            <div className="mx-auto mb-6 h-12 w-12 animate-pulse rounded-full bg-[rgba(52,211,153,0.16)] shadow-[0_0_40px_rgba(52,211,153,0.18)]" />
            <p className="text-sm uppercase tracking-[0.3em] text-[var(--color-muted)]">
              Loading playlist studio
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="relative z-20 px-4 py-8 sm:px-6 lg:px-8">
      <CursorGlow />
      <div className="mx-auto flex max-w-7xl flex-col gap-8">
        <section className="glass-panel accent-grid overflow-hidden rounded-[32px] px-6 py-8 sm:px-8 lg:px-10">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="mb-3 text-sm uppercase tracking-[0.35em] text-[var(--color-secondary)]">
                Playlist Studio
              </p>
              <h1 className="text-4xl font-semibold tracking-tight text-[var(--color-text)] sm:text-5xl lg:text-6xl">
                Search artists, audition tracks, and shape the next playlist.
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-[var(--color-muted)] sm:text-lg">
                Build from artist momentum, grab fast previews, and push tracks into a fresh playlist or an existing one without leaving the app.
              </p>
            </div>

            <div className="glass-panel glass-panel-emerald rounded-3xl px-5 py-4">
              <p className="text-xs uppercase tracking-[0.3em] text-[var(--color-muted)]">
                Draft size
              </p>
              <p className="mt-3 text-3xl font-semibold text-[var(--color-text)]">
                {playlistDraft.length}
              </p>
              <p className="mt-2 text-sm text-[var(--color-muted)]">
                Tracks waiting for export
              </p>
            </div>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-6">
            <article className="glass-panel rounded-[30px] p-6 sm:p-7">
              <div className="mb-5">
                <p className="text-sm uppercase tracking-[0.3em] text-[var(--color-muted)]">
                  Artist Search
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-[var(--color-text)]">
                  Find a starting point
                </h2>
              </div>

              <div className="relative">
                <input
                  value={query}
                  onChange={(event) => {
                    const nextQuery = event.target.value;
                    setQuery(nextQuery);
                    if (!nextQuery.trim()) {
                      setSuggestions([]);
                    }
                  }}
                  placeholder="Search for an artist"
                  className="w-full rounded-[22px] border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] px-5 py-4 text-[var(--color-text)] outline-none transition-all duration-200 ease-out placeholder:text-[var(--color-muted)] focus:border-[rgba(167,139,250,0.4)] focus:shadow-[0_0_0_4px_rgba(167,139,250,0.08)]"
                />

                {suggestions.length > 0 && (
                  <ul className="glass-panel absolute left-0 right-0 top-[calc(100%+12px)] z-30 max-h-80 space-y-2 overflow-y-auto rounded-[24px] p-3">
                    {suggestions.map((artist) => (
                      <li key={artist.id}>
                        <button
                          type="button"
                          onClick={() => selectArtist(artist)}
                          className="flex w-full items-center gap-3 rounded-[20px] px-3 py-3 text-left transition-all duration-200 ease-out hover:bg-[rgba(255,255,255,0.04)]"
                        >
                          {artist.images[0] ? (
                            <img
                              src={artist.images[0].url}
                              width={44}
                              height={44}
                              alt={artist.name}
                              className="h-11 w-11 rounded-2xl object-cover"
                            />
                          ) : (
                            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[rgba(255,255,255,0.05)] text-[var(--color-muted)]">
                              ♪
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="truncate font-semibold text-[var(--color-text)]">
                              {artist.name}
                            </p>
                            <p className="truncate text-sm text-[var(--color-muted)]">
                              {artist.followers.total.toLocaleString()} followers
                            </p>
                          </div>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </article>

            <div className="space-y-6">
              {selectedArtists.map((artist) => (
                <article
                  key={artist.id}
                  className="glass-panel rounded-[30px] p-6 sm:p-7"
                >
                  <div className="mb-6 flex items-center gap-4">
                    {artist.images[0] ? (
                      <img
                        src={artist.images[0].url}
                        width={72}
                        height={72}
                        alt={artist.name}
                        className="h-[72px] w-[72px] rounded-[24px] object-cover"
                      />
                    ) : (
                      <div className="flex h-[72px] w-[72px] items-center justify-center rounded-[24px] bg-[rgba(255,255,255,0.05)] text-2xl text-[var(--color-muted)]">
                        ♪
                      </div>
                    )}
                    <div>
                      <p className="text-xs uppercase tracking-[0.3em] text-[var(--color-muted)]">
                        Selected Artist
                      </p>
                      <h2 className="mt-2 text-2xl font-semibold text-[var(--color-text)]">
                        {artist.name}
                      </h2>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {(artistTracks[artist.id] ?? []).map((track) => (
                      <div
                        key={track.id}
                        className="glass-panel hover-lift rounded-[22px] p-4"
                      >
                        <div className="flex flex-col gap-4 md:flex-row md:items-center">
                          <div className="flex min-w-0 flex-1 items-center gap-4">
                            {track.album.images[0] ? (
                              <img
                                src={track.album.images[0].url}
                                width={56}
                                height={56}
                                alt={track.album.name}
                                className="h-14 w-14 rounded-2xl object-cover"
                              />
                            ) : (
                              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[rgba(255,255,255,0.05)] text-[var(--color-muted)]">
                                ♪
                              </div>
                            )}
                            <div className="min-w-0">
                              <p className="truncate font-semibold text-[var(--color-text)]">
                                {track.name}
                              </p>
                              <p className="truncate text-sm text-[var(--color-muted)]">
                                {track.artists.map((entry) => entry.name).join(", ")}
                              </p>
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => handlePreviewClick(track)}
                              className="rounded-full border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] px-4 py-2 text-sm font-medium text-[var(--color-text)] transition-all duration-200 ease-out hover:-translate-y-0.5 hover:border-[rgba(167,139,250,0.28)] hover:text-[var(--color-accent)]"
                            >
                              {previews[track.id]?.loading
                                ? "Loading..."
                                : previews[track.id]?.url === null
                                  ? "No preview"
                                  : "Preview"}
                            </button>
                            <button
                              type="button"
                              onClick={() => addToPlaylist(track)}
                              className="rounded-full bg-[var(--color-accent)] px-4 py-2 text-sm font-semibold text-[#0D0D12] transition-all duration-200 ease-out hover:-translate-y-0.5 hover:bg-[#b39afb] hover:shadow-[0_12px_32px_rgba(167,139,250,0.28)]"
                            >
                              Add Track
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </div>

          <aside className="space-y-6">
            <article className="glass-panel glass-panel-emerald rounded-[30px] p-6 sm:p-7">
              <div className="mb-6 flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-[var(--color-muted)]">
                    Playlist Draft
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold text-[var(--color-text)]">
                    Tracks queued for export
                  </h2>
                </div>
                <div className="rounded-2xl bg-[rgba(52,211,153,0.1)] px-3 py-2 text-sm font-semibold text-[var(--color-secondary)]">
                  {playlistDraft.length}
                </div>
              </div>

              {playlistDraft.length === 0 ? (
                <p className="text-sm leading-6 text-[var(--color-muted)]">
                  Add a few tracks from the artist panels and they will collect here, ready to send into Spotify.
                </p>
              ) : (
                <div className="space-y-3">
                  {playlistDraft.map((track) => (
                    <div
                      key={track.id}
                      className="rounded-[22px] border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.03)] p-4"
                    >
                      <div className="flex items-center gap-4">
                        {track.album.images[0] ? (
                          <img
                            src={track.album.images[0].url}
                            width={52}
                            height={52}
                            alt={track.album.name}
                            className="h-[52px] w-[52px] rounded-2xl object-cover"
                          />
                        ) : (
                          <div className="flex h-[52px] w-[52px] items-center justify-center rounded-2xl bg-[rgba(255,255,255,0.05)] text-[var(--color-muted)]">
                            ♪
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-semibold text-[var(--color-text)]">
                            {track.name}
                          </p>
                          <p className="truncate text-sm text-[var(--color-muted)]">
                            {track.artists.map((artist) => artist.name).join(", ")}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFromPlaylist(track.id)}
                          className="text-sm font-medium text-[var(--color-muted)] transition-colors duration-200 ease-out hover:text-[var(--color-secondary)]"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={createSpotifyPlaylist}
                  className="rounded-full bg-[var(--color-accent)] px-5 py-3 text-sm font-semibold text-[#0D0D12] transition-all duration-200 ease-out hover:-translate-y-0.5 hover:bg-[#b39afb] hover:shadow-[0_12px_32px_rgba(167,139,250,0.28)]"
                >
                  Create New Playlist
                </button>
                <button
                  type="button"
                  onClick={openAddToPlaylistModal}
                  className="rounded-full border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] px-5 py-3 text-sm font-semibold text-[var(--color-text)] transition-all duration-200 ease-out hover:-translate-y-0.5 hover:border-[rgba(52,211,153,0.28)] hover:text-[var(--color-secondary)]"
                >
                  Add to Existing Playlist
                </button>
              </div>
            </article>
          </aside>
        </section>
      </div>

      {showPlaylistModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(13,13,18,0.74)] px-4 backdrop-blur-sm">
          <div className="glass-panel w-full max-w-md rounded-[28px] p-6">
            <p className="text-sm uppercase tracking-[0.3em] text-[var(--color-muted)]">
              Existing Playlists
            </p>
            <h3 className="mt-2 text-2xl font-semibold text-[var(--color-text)]">
              Add your draft to a playlist
            </h3>

            {loadingPlaylists ? (
              <p className="mt-6 text-sm text-[var(--color-muted)]">
                Loading playlists...
              </p>
            ) : (
              <select
                className="mt-6 w-full rounded-[20px] border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] px-4 py-3 text-[var(--color-text)] outline-none transition-colors duration-200 ease-out"
                onChange={(event) => setSelectedPlaylistId(event.target.value)}
                defaultValue=""
              >
                <option value="" disabled>
                  Select a playlist
                </option>
                {playlists.map((playlist) => (
                  <option key={playlist.id} value={playlist.id}>
                    {playlist.name}
                  </option>
                ))}
              </select>
            )}

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowPlaylistModal(false)}
                className="rounded-full border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] px-4 py-2 text-sm font-medium text-[var(--color-text)] transition-colors duration-200 ease-out hover:text-[var(--color-muted)]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={addToExistingPlaylist}
                className="rounded-full bg-[var(--color-secondary)] px-4 py-2 text-sm font-semibold text-[#0D0D12] transition-all duration-200 ease-out hover:-translate-y-0.5 hover:bg-[#48dca7] hover:shadow-[0_12px_32px_rgba(52,211,153,0.24)]"
              >
                Add Tracks
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
