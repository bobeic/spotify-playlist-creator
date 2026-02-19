import type { ConnectionOptions } from "bullmq";

export const redisConnection: ConnectionOptions = {
  host: "localhost",
  port: 6379,
  // OR if you want URL-based:
  // url: process.env.REDIS_URL ?? "redis://localhost:6379"
};
