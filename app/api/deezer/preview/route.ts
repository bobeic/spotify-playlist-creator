import { NextRequest, NextResponse } from "next/server";

type DeezerTrack = {
  preview?: string | null;
};

type DeezerSearchResponse = {
  data?: DeezerTrack[];
};

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
  const data: DeezerSearchResponse = await res.json();

  const match = data.data?.find((track) => track.preview);

  return NextResponse.json({
    preview: match?.preview || null,
  });
}
