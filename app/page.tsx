"use client";
import { useEffect, useState } from "react";

export default function Home() {
  const [dashboard, setDashboard] = useState<any>(null);
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

  if (loading) return <p>Loading...</p>;
  
    if (!dashboard)
    return (
      <main className="p-6 bg-gray-900 min-h-screen text-white flex flex-col items-center justify-center">
        <p className="mb-4 text-lg">Please login to view your dashboard</p>
        <a
          href="/api/auth/login"
          className="bg-green-500 hover:bg-green-600 px-6 py-3 rounded-lg font-semibold transition"
        >
          Login with Spotify
        </a>
      </main>
    );

  return (
    <main className="p-6 bg-gray-900 min-h-screen text-white">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-800 p-4 rounded-lg shadow">
          <h2 className="font-semibold">Top Tracks This Week</h2>
          <ul>
            {dashboard.topTracks.map((t: any) => (
              <li key={t.spotifyTrackId}>
                {t.trackName} — {t._count.spotifyTrackId} plays
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-gray-800 p-4 rounded-lg shadow">
          <h2 className="font-semibold">Top Artists This Week</h2>
          <ul>
            {dashboard.topArtists.map((a: any) => (
              <li key={a.artistName}>
                {a.artistName} — {a._count.artistName} plays
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-gray-800 p-4 rounded-lg shadow">
          <h2 className="font-semibold">New Tracks This Week</h2>
          <ul>
            {dashboard.newTracks.map((t: any) => (
              <li key={t.spotifyTrackId}>{t.trackName}</li>
            ))}
          </ul>
        </div>

        <div className="bg-gray-800 p-4 rounded-lg shadow">
          <h2 className="font-semibold">Recently Played</h2>
          <ul>
            {dashboard.recentPlays.map((t: any) => (
              <li key={t.spotifyTrackId}>{t.trackName} — {t.artistName}</li>
            ))}
          </ul>
        </div>
      </div>
    </main>
  );
}
