"use client";

import React from "react";

export default function LoginPage() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-md text-center space-y-6">
        <h1 className="text-4xl font-bold">Welcome to Spotify Playlist Generator</h1>
        <p className="text-gray-300">
          Discover, create, and manage your Spotify playlists effortlessly. Login with Spotify to get started.
        </p>

        <a
          href="/api/auth/login"
          className="inline-block bg-green-500 hover:bg-green-600 px-6 py-3 rounded-lg font-semibold transition-all duration-200"
        >
          Login with Spotify
        </a>

        <p className="text-gray-500 text-sm">
          By logging in, you authorize this app to access your Spotify account to create playlists and view your top tracks.
        </p>
      </div>
    </main>
  );
}
