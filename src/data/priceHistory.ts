export type PriceHistoryStore = 'steam' | 'epic' | 'gog'

export type PricePoint = {
  date: string // YYYY-MM-DD (tanggal lokal)
  price: number
  originalPrice: number
  discount: number // persen
}

// Dummy: peluang diskon dibuat lebih sering 0% agar terasa seperti data toko asli.
const DISCOUNT_STEPS = [0, 0, 0, 10, 15, 20, 25, 33, 40, 50, 60, 67, 75] as const

function hashString(input: string): number {
  let hash = 2166136261
  for (let index = 0; index < input.length; index++) {
    hash ^= input.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }
  return hash >>> 0
}

function formatLocalDate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// Hari-hari sebelumnya di-hash dari tanggalnya, jadi nilainya stabil saat halaman di-refresh.
// Setiap hari baru akan menggeser jendela 30 hari ke depan.
export function buildDummyPriceHistory({
  gameId,
  store,
  originalPrice,
  currentPrice,
  days = 30,
}: {
  gameId: string
  store: PriceHistoryStore
  originalPrice: number
  currentPrice?: number
  days?: number
}): PricePoint[] {
  const today = new Date()
  const points: PricePoint[] = []

  for (let offset = days - 1; offset >= 0; offset--) {
    const date = new Date(today.getFullYear(), today.getMonth(), today.getDate() - offset)
    const key = formatLocalDate(date)
    const useLiveToday = offset === 0 && currentPrice !== undefined

    if (useLiveToday && originalPrice > 0) {
      const discount = Math.max(0, Math.round((1 - currentPrice / originalPrice) * 100))
      points.push({ date: key, price: currentPrice, originalPrice, discount })
      continue
    }

    const discount = DISCOUNT_STEPS[hashString(`${gameId}|${store}|${key}`) % DISCOUNT_STEPS.length]
    const price = Math.round(originalPrice * (1 - discount / 100))
    points.push({ date: key, price, originalPrice, discount })
  }

  return points
}
