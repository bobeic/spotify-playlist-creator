import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get("q");
  if (!query) {
    return NextResponse.json({ error: "Missing query" }, { status: 400 });
  }

  const cookieStore = await cookies();
  const accessToken = cookieStore.get("spotify_access_token")?.value;
  if (!accessToken) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const res = await fetch(
    `https://api.spotify.com/v1/search?q=${encodeURIComponent(
      query
    )}&type=artist&limit=5`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  const data = await res.json();

  if (!res.ok) {
    console.error("Spotify search error:", data);
    return NextResponse.json(
      { error: data.error?.message ?? "Spotify API error" },
      { status: res.status }
    );
  }

  return NextResponse.json(data.artists.items);

}
