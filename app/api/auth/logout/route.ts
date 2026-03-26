import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("sessionId")?.value;

  if (sessionId) {
    await prisma.session.deleteMany({
      where: {
        id: sessionId,
      },
    });
  }

  const response = NextResponse.redirect(new URL("/login", request.url));
  response.cookies.set("sessionId", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: new Date(0),
  });

  return response;
}
