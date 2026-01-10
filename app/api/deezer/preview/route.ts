import { NextRequest, NextResponse } from "next/server";

const normalizeTrack = (name: string) =>
  name
    .replace(/\(feat\.[^)]+\)/gi, "")
    .replace(/\(with [^)]+\)/gi, "")
    .replace(/\[[^\]]+\]/g, "")
    .trim();

export async function GET(req: NextRequest) {
  const track = req.nextUrl.searchParams.get("track");
  const artist = req.nextUrl.searchParams.get("artist");

  if (!track || !artist) {
    return NextResponse.json({ preview: null });
  }

  const cleanTrack = normalizeTrack(track);

  const q = `artist:"${artist}" track:"${cleanTrack}"`;
  const url = `https://api.deezer.com/search?q=${encodeURIComponent(q)}&limit=3`;

  const res = await fetch(url);
  const data = await res.json();
  console.log("Deezer preview:", data.preview);

  const match = data?.data?.find((t: any) => t.preview);

  return NextResponse.json({
    preview: match?.preview || null,
  });
}
