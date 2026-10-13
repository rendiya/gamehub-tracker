// Kontrak respons API. Dipakai worker/ sekarang, dan oleh src/ saat frontend disambungkan.
// Bentuk CatalogItem sengaja kompatibel dengan GameCardData di src/types/game.ts.

export type StoreCode = 'steam' | 'epic' | 'gog'

export type CatalogSort = 'latest' | 'discount' | 'lowest'

export type CatalogItem = {
  id: string // ID game, sama di semua toko
  listingId: number
  title: string
  coverSrc: string
  store: StoreCode
  originalPrice: number
  currentPrice: number
  discountPercent: number
  rating: number | null
  genres: string[]
  storeUrl: string
}

export type Paginated<T> = {
  items: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export type StoreInfo = { code: StoreCode; name: string; isActive: boolean }
export type GenreInfo = { slug: string; name: string }

export type HomeResponse = {
  sections: (StoreInfo & { games: CatalogItem[] })[]
}

export type SystemSpec = { label: string; value: string }

export type GameMedia =
  | { id: string; kind: 'image'; src: string; alt: string }
  | { id: string; kind: 'video'; poster: string; src?: string; alt: string }

export type StoreOffer = {
  listingId: number
  store: StoreCode
  storeName: string
  originalPrice: number
  currentPrice: number
  discountPercent: number
  storeUrl: string
  lastSyncedAt: number | null
}

export type GameDetail = {
  id: string
  title: string
  coverSrc: string
  heroSrc: string | null
  rating: number | null
  genres: string[]
  description: string[]
  gallery: GameMedia[]
  requirements: { minimum: SystemSpec[]; recommended: SystemSpec[] }
  offers: StoreOffer[]
}

export type PricePoint = {
  date: string // YYYY-MM-DD
  price: number
  originalPrice: number
  discount: number // persen
}

export type PriceHistoryResponse = {
  gameId: string
  store: StoreCode
  days: number
  points: PricePoint[]
}

export type ApiError = { error: { code: string; message: string } }
