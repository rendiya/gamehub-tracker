// Cerminan migrations/0001_init.sql untuk query bertipe. Ubah keduanya bersamaan.
import { integer, primaryKey, real, sqliteTable, text, unique } from 'drizzle-orm/sqlite-core'

export const stores = sqliteTable('stores', {
  id: integer('id').primaryKey(),
  code: text('code').notNull().unique(),
  name: text('name').notNull(),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  sortOrder: integer('sort_order').notNull().default(0),
})

export const games = sqliteTable('games', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  coverPath: text('cover_path').notNull(),
  heroPath: text('hero_path'),
  description: text('description'),
  rating: real('rating'),
  createdAt: integer('created_at').notNull(),
})

export const genres = sqliteTable('genres', {
  id: integer('id').primaryKey(),
  slug: text('slug').notNull().unique(),
  name: text('name').notNull(),
})

export const gameGenres = sqliteTable(
  'game_genres',
  {
    gameId: text('game_id').notNull().references(() => games.id, { onDelete: 'cascade' }),
    genreId: integer('genre_id').notNull().references(() => genres.id, { onDelete: 'cascade' }),
    sortOrder: integer('sort_order').notNull().default(0),
  },
  (table) => [primaryKey({ columns: [table.gameId, table.genreId] })],
)

export const gameMedia = sqliteTable('game_media', {
  id: text('id').primaryKey(),
  gameId: text('game_id').notNull().references(() => games.id, { onDelete: 'cascade' }),
  kind: text('kind', { enum: ['image', 'video'] }).notNull(),
  path: text('path'),
  posterPath: text('poster_path'),
  alt: text('alt').notNull(),
  sortOrder: integer('sort_order').notNull().default(0),
})

export const systemRequirements = sqliteTable('system_requirements', {
  id: integer('id').primaryKey(),
  gameId: text('game_id').notNull().references(() => games.id, { onDelete: 'cascade' }),
  tier: text('tier', { enum: ['minimum', 'recommended'] }).notNull(),
  label: text('label').notNull(),
  value: text('value').notNull(),
  sortOrder: integer('sort_order').notNull().default(0),
})

export const storeListings = sqliteTable(
  'store_listings',
  {
    id: integer('id').primaryKey(),
    gameId: text('game_id').notNull().references(() => games.id, { onDelete: 'cascade' }),
    storeId: integer('store_id').notNull().references(() => stores.id),
    externalId: text('external_id'),
    storeUrl: text('store_url').notNull(),
    originalPrice: integer('original_price').notNull(),
    currentPrice: integer('current_price').notNull(),
    discountPercent: integer('discount_percent').notNull().default(0),
    lastSyncedAt: integer('last_synced_at'),
  },
  (table) => [unique().on(table.gameId, table.storeId)],
)

export const priceHistory = sqliteTable(
  'price_history',
  {
    id: integer('id').primaryKey(),
    listingId: integer('listing_id').notNull().references(() => storeListings.id, { onDelete: 'cascade' }),
    recordedOn: text('recorded_on').notNull(),
    price: integer('price').notNull(),
    originalPrice: integer('original_price').notNull(),
    discountPercent: integer('discount_percent').notNull(),
  },
  (table) => [unique().on(table.listingId, table.recordedOn)],
)

export const syncRuns = sqliteTable('sync_runs', {
  id: integer('id').primaryKey(),
  startedAt: integer('started_at').notNull(),
  finishedAt: integer('finished_at'),
  status: text('status', { enum: ['running', 'success', 'partial', 'failed'] }).notNull(),
  checked: integer('checked').notNull().default(0),
  updated: integer('updated').notNull().default(0),
  message: text('message'),
})
