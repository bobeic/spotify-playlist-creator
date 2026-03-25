import { NextRequest, NextResponse } from "next/server";
import { getSpotifyRedirectUri } from "@/lib/auth/config";

const SCOPES = [
  "playlist-modify-public",
  "playlist-modify-private",
  "user-read-private",
  "playlist-read-private",
  "user-read-recently-played"
].join(" ");

export async function GET(req: NextRequest) {
  const redirectUri = getSpotifyRedirectUri(req);

  const params = new URLSearchParams({
    response_type: "code",
    client_id: process.env.SPOTIFY_CLIENT_ID!,
    scope: SCOPES,
    redirect_uri: redirectUri,
  });

  const authUrl = `https://accounts.spotify.com/authorize?${params.toString()}`;

  console.log("Spotify auth URL:", authUrl);

  return NextResponse.redirect(authUrl);
}
