import { NextRequest } from "next/server";

function isLocalOrigin(origin?: string) {
  if (!origin) return false;

  try {
    const { hostname } = new URL(origin);
    return hostname === "localhost" || hostname === "127.0.0.1";
  } catch {
    return false;
  }
}

export function getAppOrigin(req?: NextRequest) {
  const requestOrigin = req?.nextUrl.origin;

  // In local development, always stick to the exact origin the browser is using
  // so session cookies are set and read on the same host.
  if (isLocalOrigin(requestOrigin)) {
    return requestOrigin;
  }

  return (
    process.env.NEXT_PUBLIC_BASE_URL ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined) ??
    requestOrigin ??
    "http://127.0.0.1:3000"
  );
}

export function getSpotifyRedirectUri(req?: NextRequest) {
  return process.env.SPOTIFY_REDIRECT_URI ?? `${getAppOrigin(req)}/api/auth/callback`;
}
