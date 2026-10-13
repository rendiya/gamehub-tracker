import { asc, eq, sql } from 'drizzle-orm'

import type { Db } from '../db/client'
import { storeListings, stores, syncRuns } from '../db/schema'
import { recordDailySnapshot } from './priceService'

// Plan Free membatasi ~50 subrequest per eksekusi. Steam menerima banyak App ID dalam
// satu panggilan bila filters=price_overview, jadi satu batch = satu subrequest.
const BATCH_SIZE = 40
const STEAM_APPDETAILS_URL = 'https://store.steampowered.com/api/appdetails'

type SteamPriceOverview = {
  currency: string
  initial: number // dalam satuan sen (Rupiah x 100)
  final: number
  discount_percent: number
}

type SteamAppDetails = Record<string, { success: boolean; data?: { price_overview?: SteamPriceOverview } | [] }>

export async function fetchSteamPrices(appIds: string[]): Promise<Map<string, SteamPriceOverview>> {
  const url = new URL(STEAM_APPDETAILS_URL)
  url.searchParams.set('appids', appIds.join(','))
  url.searchParams.set('cc', 'id')
  url.searchParams.set('filters', 'price_overview')

  const response = await fetch(url, { headers: { 'Accept': 'application/json' } })
  if (!response.ok) throw new Error(`Steam merespons ${response.status}`)

  const body = (await response.json()) as SteamAppDetails
  const prices = new Map<string, SteamPriceOverview>()
  for (const [appId, entry] of Object.entries(body)) {
    const overview = entry.success && !Array.isArray(entry.data) ? entry.data?.price_overview : undefined
    if (overview?.currency === 'IDR') prices.set(appId, overview)
  }
  return prices
}

export type SyncResult = { status: 'success' | 'partial' | 'failed'; checked: number; updated: number; message?: string }

// Ambil harga Steam untuk listing yang paling lama tidak disinkronkan, lalu catat
// titik riwayat hari ini untuk semua listing (termasuk Epic yang harganya dari seed).
export async function runPriceSync(db: Db): Promise<SyncResult> {
  const startedAt = Date.now()
  const [run] = await db.insert(syncRuns).values({ startedAt, status: 'running' }).returning({ id: syncRuns.id })

  let result: SyncResult
  try {
    const listings = await db
      .select({ id: storeListings.id, externalId: storeListings.externalId })
      .from(storeListings)
      .innerJoin(stores, eq(stores.id, storeListings.storeId))
      .where(eq(stores.code, 'steam'))
      .orderBy(sql`${storeListings.lastSyncedAt} IS NOT NULL`, asc(storeListings.lastSyncedAt))
      .limit(BATCH_SIZE)

    const withAppId = listings.filter((listing): listing is { id: number; externalId: string } =>
      Boolean(listing.externalId),
    )
    const prices = withAppId.length ? await fetchSteamPrices(withAppId.map((listing) => listing.externalId)) : new Map()

    const now = Date.now()
    const updates = withAppId.map((listing) => {
      const price = prices.get(listing.externalId)
      return db
        .update(storeListings)
        .set(
          price
            ? {
                originalPrice: Math.round(price.initial / 100),
                currentPrice: Math.round(price.final / 100),
                discountPercent: price.discount_percent,
                lastSyncedAt: now,
              }
            : { lastSyncedAt: now }, // tetap digeser agar tidak memblokir antrean batch berikutnya
        )
        .where(eq(storeListings.id, listing.id))
    })
    if (updates.length) {
      const [first, ...rest] = updates
      await db.batch([first, ...rest])
    }

    await recordDailySnapshot(db)

    const missing = withAppId.length - prices.size
    result = {
      status: missing > 0 ? 'partial' : 'success',
      checked: withAppId.length,
      updated: prices.size,
      ...(missing > 0 ? { message: `${missing} App ID tanpa harga IDR dari Steam` } : {}),
    }
  } catch (error) {
    result = { status: 'failed', checked: 0, updated: 0, message: error instanceof Error ? error.message : String(error) }
  }

  await db
    .update(syncRuns)
    .set({ finishedAt: Date.now(), status: result.status, checked: result.checked, updated: result.updated, message: result.message ?? null })
    .where(eq(syncRuns.id, run.id))

  return result
}
