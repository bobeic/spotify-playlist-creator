import { prisma } from "@/lib/prisma";
import { enqueueUserFetch } from "./spotifyQueue";

export async function enqueueAllUsers() {
  const users = await prisma.user.findMany({
    include: { spotifyAccount: true },
  });

  for (const user of users) {
    if (user.spotifyAccount) {
      await enqueueUserFetch(user.id);
    }
  }
}
