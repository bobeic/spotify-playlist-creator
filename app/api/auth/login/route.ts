import { NextResponse } from "next/server";

const SCOPES = [
  "playlist-modify-public",
  "playlist-modify-private",
  "user-read-private",
  "playlist-read-private"
].join(" ");

export async function GET() {
  console.log("NODE_ENV:", process.env.NODE_ENV);
  console.log("SPOTIFY_REDIRECT_URI:", process.env.SPOTIFY_REDIRECT_URI);

  const params = new URLSearchParams({
    response_type: "code",
    client_id: process.env.SPOTIFY_CLIENT_ID!,
    scope: SCOPES,
    redirect_uri: process.env.SPOTIFY_REDIRECT_URI!,
  });

  const authUrl = `https://accounts.spotify.com/authorize?${params.toString()}`;

  console.log("Spotify auth URL:", authUrl);

  return NextResponse.redirect(authUrl);
}