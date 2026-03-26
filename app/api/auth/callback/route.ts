import { NextRequest, NextResponse } from "next/server";
import { upsertSpotifyUser } from "@/lib/auth/spotify";
import { createSession } from "@/lib/auth/session";
import { getSpotifyRedirectUri } from "@/lib/auth/config";

export async function GET(req: NextRequest) {
  const spotifyError = req.nextUrl.searchParams.get("error");
  const code = req.nextUrl.searchParams.get("code");
  const redirectUri = getSpotifyRedirectUri(req);

  if (spotifyError) {
    return NextResponse.redirect(new URL(`/login?auth_error=${spotifyError}`, req.nextUrl.origin));
  }

  if (!code) {
    return NextResponse.json({ error: "No code provided" }, { status: 400 });
  }

  // 1️⃣ Exchange code for token
  const tokenRes = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization:
        "Basic " +
        Buffer.from(
          `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
        ).toString("base64"),
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
    }),
  });

  const tokenData: {
    access_token: string
    refresh_token: string
    expires_in: number
    scope?: string
  } = await tokenRes.json()


  if (!tokenRes.ok) {
    return NextResponse.json(tokenData, { status: 400 });
  }

  // 2️⃣ Fetch Spotify profile
  const profileRes = await fetch("https://api.spotify.com/v1/me", {
    headers: { Authorization: `Bearer ${tokenData.access_token}` },
  });

  if (!profileRes.ok) {
    return NextResponse.json({ error: "Failed to fetch Spotify profile" }, { status: 400 });
  }

  const spotifyProfile = await profileRes.json();

  // 3️⃣ Upsert user + SpotifyAccount in DB
  const user = await upsertSpotifyUser({
    spotifyProfile,
    tokens: {
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token,
      expiresAt: new Date(Date.now() + tokenData.expires_in * 1000),
      scope: tokenData.scope,
    },
  });

  // 4️⃣ Create a Session
  const session = await createSession(user.id);

  // 5️⃣ Set session cookie (use this instead of storing token directly)
  const response = NextResponse.redirect(new URL("/dashboard", req.nextUrl.origin));

  response.cookies.set("sessionId", session.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return response;
}
