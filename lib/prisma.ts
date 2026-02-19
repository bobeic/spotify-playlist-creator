import { PrismaClient } from "../app/generated/prisma/client"
// import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaPg } from "@prisma/adapter-pg"

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
})

// Use a global cache so dev mode hot reloads don’t create multiple instances
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    adapter,
    log: ["query", "error", "warn"], // optional logging
  })

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma
}
