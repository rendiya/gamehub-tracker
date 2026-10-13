import { and, asc, count, desc, eq, inArray, or, sql, type SQL } from 'drizzle-orm'

import type {
  CatalogItem,
  CatalogSort,
  GameDetail,
  GameMedia,
  HomeResponse,
  Paginated,
  StoreCode,
  StoreOffer,
} from '../../shared/types'
import type { Db } from '../db/client'
import {
  gameGenres,
  gameMedia,
  games,
  genres,
  storeListings,
  stores,
  systemRequirements,
} from '../db/schema'

export type CatalogFilters = {
  q?: string
  stores?: string[]
  genres?: string[] // slug genre
  sort?: CatalogSort
  page?: number
  pageSize?: number
}

const HOME_GAMES_PER_STORE = 4

// LIKE di SQLite tidak peka huruf besar/kecil untuk ASCII. % dan _ dari input di-escape.
function containsPattern(value: string): string {
  return `%${value.replace(/[\\%_]/g, (char) => `\\${char}`)}%`
}

function likeEscaped(column: SQL | typeof games.title, pattern: string): SQL {
  return sql`${column} LIKE ${pattern} ESCAPE '\\'`
}

// Benar bila game pada baris katalog punya minimal satu genre yang memenuhi kondisi.
function hasGenreWhere(condition: SQL): SQL {
  return sql`EXISTS (SELECT 1 FROM ${gameGenres}
    INNER JOIN ${genres} ON ${genres.id} = ${gameGenres.genreId}
    WHERE ${gameGenres.gameId} = ${games.id} AND ${condition})`
}

function catalogWhere(filters: CatalogFilters): SQL | undefined {
  const conditions: SQL[] = [eq(stores.isActive, true)]

  if (filters.stores?.length) {
    conditions.push(inArray(stores.code, filters.stores))
  }

  if (filters.genres?.length) {
    conditions.push(hasGenreWhere(inArray(genres.slug, filters.genres)))
  }

  const q = filters.q?.trim()
  if (q) {
    // Sama seperti pencarian di frontend: judul, nama toko, atau nama genre.
    const pattern = containsPattern(q)
    const searchCondition = or(
      likeEscaped(games.title, pattern),
      likeEscaped(sql`${stores.name}`, pattern),
      hasGenreWhere(likeEscaped(sql`${genres.name}`, pattern)),
    )
    if (searchCondition) conditions.push(searchCondition)
  }

  return and(...conditions)
}

function catalogOrder(sort: CatalogSort): SQL[] {
  switch (sort) {
    case 'discount':
      return [desc(storeListings.discountPercent), asc(storeListings.currentPrice), asc(storeListings.id)]
    case 'lowest':
      return [asc(storeListings.currentPrice), asc(games.title), asc(storeListings.id)]
    case 'latest':
      return [desc(games.createdAt), asc(stores.sortOrder), asc(storeListings.id)]
  }
}

async function genresByGame(db: Db, gameIds: string[]): Promise<Map<string, string[]>> {
  const result = new Map<string, string[]>()
  if (gameIds.length === 0) return result

  const rows = await db
    .select({ gameId: gameGenres.gameId, name: genres.name })
    .from(gameGenres)
    .innerJoin(genres, eq(genres.id, gameGenres.genreId))
    .where(inArray(gameGenres.gameId, gameIds))
    .orderBy(asc(gameGenres.sortOrder))

  for (const row of rows) {
    const list = result.get(row.gameId) ?? []
    list.push(row.name)
    result.set(row.gameId, list)
  }
  return result
}

export async function searchCatalog(db: Db, filters: CatalogFilters): Promise<Paginated<CatalogItem>> {
  const page = Math.max(1, filters.page ?? 1)
  const pageSize = Math.max(1, filters.pageSize ?? 6)
  const where = catalogWhere(filters)

  const [{ total }] = await db
    .select({ total: count() })
    .from(storeListings)
    .innerJoin(games, eq(games.id, storeListings.gameId))
    .innerJoin(stores, eq(stores.id, storeListings.storeId))
    .where(where)

  const rows = await db
    .select({
      id: games.id,
      listingId: storeListings.id,
      title: games.title,
      coverSrc: games.coverPath,
      store: stores.code,
      originalPrice: storeListings.originalPrice,
      currentPrice: storeListings.currentPrice,
      discountPercent: storeListings.discountPercent,
      rating: games.rating,
      storeUrl: storeListings.storeUrl,
    })
    .from(storeListings)
    .innerJoin(games, eq(games.id, storeListings.gameId))
    .innerJoin(stores, eq(stores.id, storeListings.storeId))
    .where(where)
    .orderBy(...catalogOrder(filters.sort ?? 'latest'))
    .limit(pageSize)
    .offset((page - 1) * pageSize)

  const genreMap = await genresByGame(db, [...new Set(rows.map((row) => row.id))])

  return {
    items: rows.map((row) => ({
      ...row,
      store: row.store as StoreCode,
      genres: genreMap.get(row.id) ?? [],
    })),
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  }
}

export async function getHomeSections(db: Db): Promise<HomeResponse> {
  const activeStores = await db
    .select({ code: stores.code, name: stores.name, isActive: stores.isActive })
    .from(stores)
    .where(eq(stores.isActive, true))
    .orderBy(asc(stores.sortOrder))

  const sections = await Promise.all(
    activeStores.map(async (store) => {
      const { items } = await searchCatalog(db, {
        stores: [store.code],
        sort: 'latest',
        pageSize: HOME_GAMES_PER_STORE,
      })
      return { ...store, code: store.code as StoreCode, games: items }
    }),
  )

  return { sections }
}

export async function getGameDetail(db: Db, gameId: string): Promise<GameDetail | null> {
  const game = await db.query.games.findFirst({ where: eq(games.id, gameId) })
  if (!game) return null

  const [genreMap, media, requirements, offers] = await Promise.all([
    genresByGame(db, [game.id]),
    db.select().from(gameMedia).where(eq(gameMedia.gameId, game.id)).orderBy(asc(gameMedia.sortOrder)),
    db
      .select({ tier: systemRequirements.tier, label: systemRequirements.label, value: systemRequirements.value })
      .from(systemRequirements)
      .where(eq(systemRequirements.gameId, game.id))
      .orderBy(asc(systemRequirements.sortOrder)),
    db
      .select({
        listingId: storeListings.id,
        store: stores.code,
        storeName: stores.name,
        originalPrice: storeListings.originalPrice,
        currentPrice: storeListings.currentPrice,
        discountPercent: storeListings.discountPercent,
        storeUrl: storeListings.storeUrl,
        lastSyncedAt: storeListings.lastSyncedAt,
      })
      .from(storeListings)
      .innerJoin(stores, eq(stores.id, storeListings.storeId))
      .where(and(eq(storeListings.gameId, game.id), eq(stores.isActive, true)))
      .orderBy(asc(stores.sortOrder)),
  ])

  const gallery = media.flatMap((item): GameMedia[] => {
    if (item.kind === 'image') {
      return item.path ? [{ id: item.id, kind: 'image', src: item.path, alt: item.alt }] : []
    }
    const poster = item.posterPath ?? item.path
    if (!poster) return []
    return [{ id: item.id, kind: 'video', poster, ...(item.path ? { src: item.path } : {}), alt: item.alt }]
  })

  return {
    id: game.id,
    title: game.title,
    coverSrc: game.coverPath,
    heroSrc: game.heroPath,
    rating: game.rating,
    genres: genreMap.get(game.id) ?? [],
    description: game.description ? game.description.split(/\n{2,}/) : [],
    gallery,
    requirements: {
      minimum: requirements.filter((row) => row.tier === 'minimum').map(({ label, value }) => ({ label, value })),
      recommended: requirements
        .filter((row) => row.tier === 'recommended')
        .map(({ label, value }) => ({ label, value })),
    },
    offers: offers.map((offer): StoreOffer => ({ ...offer, store: offer.store as StoreCode })),
  }
}
