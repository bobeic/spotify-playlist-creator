import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");

  if (!code) {
    return NextResponse.json({ error: "No code provided" }, { status: 400 });
  }

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
      redirect_uri: process.env.SPOTIFY_REDIRECT_URI!,
    }),
  });

  const tokenData = await tokenRes.json();

  if (!tokenRes.ok) {
    return NextResponse.json(tokenData, { status: 400 });
  }

  const response = NextResponse.redirect("http://127.0.0.1:3000");
  response.cookies.set("spotify_access_token", tokenData.access_token, {
    httpOnly: true,
    secure: false,
    path: "/",
  });
  response.cookies.set("spotify_refresh_token", tokenData.refresh_token, {
    httpOnly: true,
    secure: false,
    path: "/",
  });

  return response;
}
