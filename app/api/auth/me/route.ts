import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth/getCurrentUser"

export async function GET() {
  // ✅ Get the currently logged-in user
  const user = await getCurrentUser()
  if (!user || !user.spotifyAccount) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  // ✅ Return only the info you want to expose
  return NextResponse.json({
    id: user.spotifyId,
    displayName: user.displayName,
    email: user.email,
    imageUrl: user.imageUrl,
  })
}
