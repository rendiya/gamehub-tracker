
export type StoreId = 'steam' | 'epic'

export type GameCardData = {
  id: string
  title: string
  coverSrc: string
  store: StoreId
  originalPrice: number
  currentPrice: number
  rating: number | null
  genres: readonly string[]
}