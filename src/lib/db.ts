import { PrismaClient } from '@prisma/client'

/**
 * Lellina — Prisma Client
 *
 * Production (Render free plan):
 *   DATABASE_URL = file:./db/custom.db  (EPHEMERAL — no persistent disk on free plan)
 *   The start script runs `prisma db push` + `seed` on every boot, so the DB
 *   is recreated from scratch on each cold start. User data does NOT persist
 *   between restarts — acceptable for dev/preview. Turso replaces this later.
 *
 * Development (local sandbox):
 *   DATABASE_URL = file:/home/z/my-project/db/custom.db
 *
 * Note: Turso (libsql) was tested but Prisma 6.19's driver adapter has a
 * known URL_INVALID bug. SQLite-on-disk is used for both dev and prod.
 * Turso DB is already synced — we switch once Prisma fixes the adapter.
 */

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'production' ? ['error', 'warn'] : ['query'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
