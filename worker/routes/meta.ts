import { asc } from 'drizzle-orm'
import { Hono } from 'hono'

import type { GenreInfo, StoreCode, StoreInfo } from '../../shared/types'
import type { AppEnv } from '../app'
import { getDb } from '../db/client'
import { genres, stores } from '../db/schema'

const meta = new Hono<AppEnv>()

// GET /api/stores: termasuk toko nonaktif (GOG), frontend memutuskan cara menampilkannya.
meta.get('/stores', async (c) => {
  const rows = await getDb(c.env)
    .select({ code: stores.code, name: stores.name, isActive: stores.isActive })
    .from(stores)
    .orderBy(asc(stores.sortOrder))
  c.header('Cache-Control', 'public, max-age=300')
  return c.json<StoreInfo[]>(rows.map((row) => ({ ...row, code: row.code as StoreCode })))
})

// GET /api/genres
meta.get('/genres', async (c) => {
  const rows = await getDb(c.env)
    .select({ slug: genres.slug, name: genres.name })
    .from(genres)
    .orderBy(asc(genres.id))
  c.header('Cache-Control', 'public, max-age=300')
  return c.json<GenreInfo[]>(rows)
})

export default meta
