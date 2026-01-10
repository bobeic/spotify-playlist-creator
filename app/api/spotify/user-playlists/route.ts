import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const accessToken = req.cookies.get("spotify_access_token")?.value;
  if (!accessToken) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const res = await fetch(
    "https://api.spotify.com/v1/me/playlists?limit=50",
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

    const data = await res.json();

    if (!res.ok) {
    return NextResponse.json(
        { error: data.error?.message ?? "Spotify error" },
        { status: res.status }
    );
    }

    return NextResponse.json(data.items);
}
