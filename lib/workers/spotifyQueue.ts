import { Queue } from "bullmq";
import { redisConnection } from "../redis";

export const spotifyQueue = new Queue("spotifyQueue", {
  connection: redisConnection,
});


export async function enqueueUserFetch(userId: string) {
  await spotifyQueue.add(
    "fetchRecentlyPlayed",
    { userId },
    {
      attempts: 3,
      backoff: { type: "exponential", delay: 5000 },
      removeOnComplete: true,
      removeOnFail: false,
    }
  );
}
