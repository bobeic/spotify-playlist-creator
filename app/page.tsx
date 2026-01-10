"use client";
import { useState, useEffect, useRef } from "react";

type Artist = {
  id: string;
  name: string;
  images: { url: string }[];
  followers: { total: number };
};

export default function Home() {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Artist[]>([]);
  const [selectedArtists, setSelectedArtists] = useState<Artist[]>([]);
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);
  const [playlistDraft, setPlaylistDraft] = useState<any[]>([]);
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);
  const [playlists, setPlaylists] = useState<any[]>([]);
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string | null>(null);
  const [loadingPlaylists, setLoadingPlaylists] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  type PreviewState = {
    url?: string | null;
    loading: boolean;
  };
  const [previews, setPreviews] = useState<Record<string, PreviewState>>({});

  // Fetch suggestions with debounce
  useEffect(() => {
    if (!query) return setSuggestions([]);
    if (typingTimeout) clearTimeout(typingTimeout);

    const timeout = setTimeout(async () => {
      const res = await fetch(`/api/spotify/search-artists?q=${query}`);
      const data = await res.json();
      setSuggestions(data);
    }, 400);

    setTypingTimeout(timeout);
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
    if (!url || !audioRef.current) return;
    const audio = audioRef.current;

    // Toggle pause if same track
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

  const handlePreviewClick = async (track: any) => {
    const state = previews[track.id];
    if (state?.url) {
      playPreview(state.url);
      return;
    }
    if (state?.loading) return;

    setPreviews((p) => ({
      ...p,
      [track.id]: { loading: true },
    }));

    const res = await fetch(
      `/api/deezer/preview?track=${encodeURIComponent(track.name)}&artist=${encodeURIComponent(
        track.artists[0].name
      )}`
    );
    const data = await res.json();

    setPreviews((p) => ({
      ...p,
      [track.id]: { url: data.preview ?? null, loading: false },
    }));

    if (data.preview) {
      playPreview(data.preview);
    }
  };

  const addToPlaylist = (track: any) => {
    if (!playlistDraft.find((t) => t.id === track.id)) {
      setPlaylistDraft([...playlistDraft, track]);
    }
  };
  const removeFromPlaylist = (trackId: string) => {
    setPlaylistDraft((prev) => prev.filter((t) => t.id !== trackId));
  };

  const [artistTracks, setArtistTracks] = useState<Record<string, any[]>>({});
  const fetchTopTracks = async (artistId: string) => {
    const res = await fetch(`/api/spotify/artist-top-tracks?artistId=${artistId}`);
    const data = await res.json();
    setArtistTracks((prev) => ({ ...prev, [artistId]: data }));
  };

  const selectArtist = (artist: Artist) => {
    if (!selectedArtists.find((a) => a.id === artist.id)) {
      setSelectedArtists([...selectedArtists, artist]);
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
    const trackUris = playlistDraft.map((t) => t.uri);
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
    } else {
      alert("Error creating playlist: " + data.error);
    }
  };

  const openAddToPlaylistModal = async () => {
    setShowPlaylistModal(true);
    if (playlists.length === 0) {
      setLoadingPlaylists(true);
      const res = await fetch("/api/spotify/user-playlists");
      const data = await res.json();
      setPlaylists(data);
      setLoadingPlaylists(false);
    }
  };

  const addToExistingPlaylist = async () => {
    if (!selectedPlaylistId || playlistDraft.length === 0) return;
    const trackUris = playlistDraft.map((t) => t.uri);

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
    } else {
      alert("Failed to add tracks");
    }
  };

  return (
    <main className="p-6 bg-gray-900 min-h-screen text-white">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Spotify Playlist Generator</h1>
        <a
          href="/api/auth/login"
          className="bg-green-500 hover:bg-green-600 px-4 py-2 rounded-lg font-semibold transition"
        >
          Login with Spotify
        </a>
      </div>

      {/* Artist Search */}
      <div className="relative w-full max-w-md mb-6">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search artist"
          className="w-full p-2 rounded-lg bg-gray-800 placeholder-gray-400 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
        />
        {suggestions.length > 0 && (
          <ul className="absolute w-full bg-gray-800 border border-gray-700 mt-1 rounded-lg max-h-60 overflow-y-auto z-50">
            {suggestions.map((artist) => (
              <li
                key={artist.id}
                onClick={() => selectArtist(artist)}
                className="flex items-center gap-2 p-2 cursor-pointer hover:bg-gray-700 rounded"
              >
                {artist.images[0] && (
                  <img
                    src={artist.images[0].url}
                    width={30}
                    height={30}
                    alt={artist.name}
                    className="rounded"
                  />
                )}
                <span>{artist.name}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Selected Artists and Tracks */}
      <div className="space-y-6">
        {selectedArtists.map((artist) => (
          <div key={artist.id} className="bg-gray-800 p-4 rounded-xl shadow">
            <div className="flex items-center gap-4 mb-4">
              {artist.images[0] && (
                <img
                  src={artist.images[0].url}
                  width={60}
                  height={60}
                  className="rounded"
                />
              )}
              <span className="font-semibold text-lg">{artist.name}</span>
            </div>

            <ul className="space-y-2">
              {artistTracks[artist.id]?.map((track) => (
                <li
                  key={track.id}
                  className="flex justify-between items-center p-2 rounded hover:bg-gray-700"
                >
                  <span>{track.name}</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handlePreviewClick(track)}
                      className="bg-gray-700 px-3 py-1 rounded hover:bg-gray-600 text-sm"
                    >
                      {previews[track.id]?.loading
                        ? "Loading..."
                        : previews[track.id]?.url === null
                        ? "No preview"
                        : "▶ Preview"}
                    </button>
                    <button
                      onClick={() => addToPlaylist(track)}
                      className="bg-green-500 hover:bg-green-600 px-3 py-1 rounded text-sm"
                    >
                      + Add
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Playlist Draft */}
      {playlistDraft.length > 0 && (
        <div className="bg-gray-800 p-4 rounded-xl shadow mt-6">
          <h2 className="text-lg font-semibold mb-2">Playlist Draft</h2>
          <ul className="space-y-1">
            {playlistDraft.map((track) => (
              <li key={track.id} className="flex justify-between items-center">
                <span>
                  {track.name} — {track.artists.map((a: any) => a.name).join(", ")}
                </span>
                <button
                  onClick={() => removeFromPlaylist(track.id)}
                  className="ml-2 text-red-500 hover:text-red-400"
                >
                  ❌ Remove
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Buttons */}
      <div className="mt-4 flex gap-2">
        <button
          onClick={createSpotifyPlaylist}
          className="px-4 py-2 bg-green-500 hover:bg-green-600 rounded-lg font-semibold"
        >
          Create New Playlist
        </button>
        <button
          onClick={openAddToPlaylistModal}
          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg font-semibold"
        >
          Add to Existing Playlist
        </button>
      </div>

      {/* Playlist Modal */}
      {showPlaylistModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-xl w-80">
            <h3 className="text-white font-semibold text-lg mb-4">
              Add to existing playlist
            </h3>
            {loadingPlaylists ? (
              <p className="text-gray-300">Loading playlists...</p>
            ) : (
              <select
                className="w-full p-2 rounded-lg bg-gray-700 text-white mb-4"
                onChange={(e) => setSelectedPlaylistId(e.target.value)}
                defaultValue=""
              >
                <option value="" disabled>
                  Select a playlist
                </option>
                {playlists.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            )}
            <div className="flex justify-end gap-2">
              <button
                onClick={addToExistingPlaylist}
                className="px-3 py-1 bg-green-500 hover:bg-green-600 rounded-lg font-semibold"
              >
                Add Tracks
              </button>
              <button
                onClick={() => setShowPlaylistModal(false)}
                className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded-lg font-semibold"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
