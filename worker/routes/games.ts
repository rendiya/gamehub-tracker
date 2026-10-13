import { Hono } from 'hono'

import type { ApiError, CatalogSort, StoreCode } from '../../shared/types'
import type { AppEnv } from '../app'
import { getDb } from '../db/client'
import { parseEnum, parseIntInRange, parseList } from '../lib/query'
import { getGameDetail, searchCatalog } from '../services/gameService'
import { getPriceHistory } from '../services/priceService'

const SORTS: readonly CatalogSort[] = ['latest', 'discount', 'lowest']
const STORES: readonly StoreCode[] = ['steam', 'epic', 'gog']
const CACHE_HEADER = 'public, max-age=60'

const games = new Hono<AppEnv>()

// GET /api/games?q=&stores=steam,epic&genres=action,rpg&sort=latest&page=1&pageSize=6
games.get('/', async (c) => {
  const query = c.req.query()
  const result = await searchCatalog(getDb(c.env), {
    q: query.q,
    stores: parseList(query.stores),
    genres: parseList(query.genres),
    sort: parseEnum(query.sort, 'sort', SORTS, 'latest'),
    page: parseIntInRange(query.page, 'page', { min: 1, max: 10_000, fallback: 1 }),
    pageSize: parseIntInRange(query.pageSize, 'pageSize', { min: 1, max: 48, fallback: 6 }),
  })
  c.header('Cache-Control', CACHE_HEADER)
  return c.json(result)
})

// GET /api/games/:gameId
games.get('/:gameId', async (c) => {
  const detail = await getGameDetail(getDb(c.env), c.req.param('gameId'))
  if (!detail) {
    return c.json<ApiError>({ error: { code: 'not_found', message: 'Game tidak ditemukan' } }, 404)
  }
  c.header('Cache-Control', CACHE_HEADER)
  return c.json(detail)
})

// GET /api/games/:gameId/price-history?store=steam&days=30
games.get('/:gameId/price-history', async (c) => {
  const store = parseEnum(c.req.query('store'), 'store', STORES, 'steam')
  const days = parseIntInRange(c.req.query('days'), 'days', { min: 1, max: 365, fallback: 30 })
  const history = await getPriceHistory(getDb(c.env), c.req.param('gameId'), store, days)
  if (!history) {
    return c.json<ApiError>({ error: { code: 'not_found', message: 'Game tidak tersedia di toko ini' } }, 404)
  }
  c.header('Cache-Control', CACHE_HEADER)
  return c.json(history)
})

export default games
