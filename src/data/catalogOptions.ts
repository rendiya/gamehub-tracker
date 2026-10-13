export const SHOPS = ['steam', 'epic', 'gog'] as const
export type ShopFilter = (typeof SHOPS)[number]

export const GENRES = [
  'Action',
  'Rpg',
  'Adventure',
  'Strategy',
  'Simulation',
  'Racing',
  'Sports',
  'Indie',
] as const
export type GenreFilter = (typeof GENRES)[number]
