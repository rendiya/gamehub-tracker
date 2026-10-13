import { Hono } from 'hono'

import type { AppEnv } from '../app'
import { getDb } from '../db/client'
import { getHomeSections } from '../services/gameService'

const home = new Hono<AppEnv>()

// GET /api/home: satu panggilan untuk semua bagian toko di beranda.
home.get('/home', async (c) => {
  c.header('Cache-Control', 'public, max-age=60')
  return c.json(await getHomeSections(getDb(c.env)))
})

export default home
