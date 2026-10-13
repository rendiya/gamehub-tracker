import { and, asc, desc, eq, gte, inArray, lt, sql } from 'drizzle-orm'

import type { PriceHistoryResponse, PricePoint, StoreCode } from '../../shared/types'
import type { Db } from '../db/client'
import { priceHistory, storeListings, stores } from '../db/schema'

const DAY_MS = 24 * 60 * 60 * 1000

// Semua tanggal riwayat memakai UTC agar sama dengan date('now') di D1 dan jadwal cron.
export function utcDate(time: number = Date.now()): string {
  return new Date(time).toISOString().slice(0, 10)
}

export function discountOf(originalPrice: number, price: number): number {
  if (originalPrice <= 0) return 0
  return Math.max(0, Math.round((1 - price / originalPrice) * 100))
}

export async function getPriceHistory(
  db: Db,
  gameId: string,
  store: StoreCode,
  days: number,
): Promise<PriceHistoryResponse | null> {
  const [listing] = await db
    .select({
      id: storeListings.id,
      originalPrice: storeListings.originalPrice,
      currentPrice: storeListings.currentPrice,
      discountPercent: storeListings.discountPercent,
    })
    .from(storeListings)
    .innerJoin(stores, eq(stores.id, storeListings.storeId))
    .where(and(eq(storeListings.gameId, gameId), eq(stores.code, store)))
  if (!listing) return null

  const now = Date.now()
  const today = utcDate(now)
  const firstDay = utcDate(now - (days - 1) * DAY_MS)

  const columns = {
    date: priceHistory.recordedOn,
    price: priceHistory.price,
    originalPrice: priceHistory.originalPrice,
    discount: priceHistory.discountPercent,
  }

  const [inRange, [beforeRange]] = await Promise.all([
    db
      .select(columns)
      .from(priceHistory)
      .where(and(eq(priceHistory.listingId, listing.id), gte(priceHistory.recordedOn, firstDay)))
      .orderBy(asc(priceHistory.recordedOn)),
    db
      .select(columns)
      .from(priceHistory)
      .where(and(eq(priceHistory.listingId, listing.id), lt(priceHistory.recordedOn, firstDay)))
      .orderBy(desc(priceHistory.recordedOn))
      .limit(1),
  ])

  // Hari tanpa catatan (mis. cron belum jalan) memakai harga terakhir yang diketahui,
  // supaya grafik selalu punya satu titik per hari. Hari ini selalu harga listing terkini.
  const byDate = new Map(inRange.map((point) => [point.date, point]))
  let last: PricePoint | undefined = beforeRange
  const points: PricePoint[] = []

  for (let offset = days - 1; offset >= 0; offset--) {
    const date = utcDate(now - offset * DAY_MS)
    if (date === today) {
      points.push({
        date,
        price: listing.currentPrice,
        originalPrice: listing.originalPrice,
        discount: listing.discountPercent,
      })
      continue
    }
    last = byDate.get(date) ?? last
    if (last) points.push({ ...last, date })
  }

  return { gameId, store, days, points }
}

// Simpan harga terkini setiap listing sebagai titik riwayat hari ini (upsert).
export async function recordDailySnapshot(db: Db, listingIds?: number[]): Promise<number> {
  const listings = await db
    .select({
      id: storeListings.id,
      originalPrice: storeListings.originalPrice,
      currentPrice: storeListings.currentPrice,
      discountPercent: storeListings.discountPercent,
    })
    .from(storeListings)
    .where(listingIds ? inArray(storeListings.id, listingIds) : undefined)
  if (listings.length === 0) return 0

  const today = utcDate()
  const [first, ...rest] = listings.map((listing) =>
    db
      .insert(priceHistory)
      .values({
        listingId: listing.id,
        recordedOn: today,
        price: listing.currentPrice,
        originalPrice: listing.originalPrice,
        discountPercent: listing.discountPercent,
      })
      .onConflictDoUpdate({
        target: [priceHistory.listingId, priceHistory.recordedOn],
        set: {
          price: sql`excluded.price`,
          originalPrice: sql`excluded.original_price`,
          discountPercent: sql`excluded.discount_percent`,
        },
      }),
  )
  await db.batch([first, ...rest])
  return listings.length
}
