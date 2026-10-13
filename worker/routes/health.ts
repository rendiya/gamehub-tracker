import { count, desc } from 'drizzle-orm'
import { Hono } from 'hono'

import type { AppEnv } from '../app'
import { getDb } from '../db/client'
import { games, syncRuns } from '../db/schema'

const health = new Hono<AppEnv>()

// GET /api/health: cek cepat setelah deploy bahwa Worker dan D1 terhubung.
health.get('/health', async (c) => {
  const db = getDb(c.env)
  const [[{ totalGames }], [lastSync]] = await Promise.all([
    db.select({ totalGames: count() }).from(games),
    db.select().from(syncRuns).orderBy(desc(syncRuns.startedAt)).limit(1),
  ])

  c.header('Cache-Control', 'no-store')
  return c.json({
    status: 'ok',
    database: { games: totalGames },
    lastPriceSync: lastSync ?? null,
  })
})

export default health
