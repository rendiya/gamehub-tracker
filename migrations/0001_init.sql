-- Skema awal GameHub (Cloudflare D1 / SQLite).
-- Harga dalam Rupiah utuh (tanpa desimal). Waktu dalam unix epoch milidetik.

CREATE TABLE stores (
  id         INTEGER PRIMARY KEY,
  code       TEXT    NOT NULL UNIQUE,
  name       TEXT    NOT NULL,
  is_active  INTEGER NOT NULL DEFAULT 1 CHECK (is_active IN (0, 1)),
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE games (
  id          TEXT    PRIMARY KEY,           -- sama dengan slug, dipakai di URL /games/:gameId
  title       TEXT    NOT NULL,
  cover_path  TEXT    NOT NULL,
  hero_path   TEXT,
  description TEXT,                          -- paragraf dipisah baris kosong
  rating      REAL,
  created_at  INTEGER NOT NULL
);

CREATE TABLE genres (
  id   INTEGER PRIMARY KEY,
  slug TEXT    NOT NULL UNIQUE,
  name TEXT    NOT NULL
);

CREATE TABLE game_genres (
  game_id    TEXT    NOT NULL REFERENCES games (id) ON DELETE CASCADE,
  genre_id   INTEGER NOT NULL REFERENCES genres (id) ON DELETE CASCADE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (game_id, genre_id)
);
CREATE INDEX idx_game_genres_genre ON game_genres (genre_id);

CREATE TABLE game_media (
  id          TEXT    PRIMARY KEY,
  game_id     TEXT    NOT NULL REFERENCES games (id) ON DELETE CASCADE,
  kind        TEXT    NOT NULL CHECK (kind IN ('image', 'video')),
  path        TEXT,                          -- gambar: wajib; video: boleh kosong (poster saja)
  poster_path TEXT,
  alt         TEXT    NOT NULL,
  sort_order  INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX idx_game_media_game ON game_media (game_id, sort_order);

CREATE TABLE system_requirements (
  id         INTEGER PRIMARY KEY,
  game_id    TEXT    NOT NULL REFERENCES games (id) ON DELETE CASCADE,
  tier       TEXT    NOT NULL CHECK (tier IN ('minimum', 'recommended')),
  label      TEXT    NOT NULL,
  value      TEXT    NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX idx_requirements_game ON system_requirements (game_id, tier, sort_order);

CREATE TABLE store_listings (
  id               INTEGER PRIMARY KEY,
  game_id          TEXT    NOT NULL REFERENCES games (id) ON DELETE CASCADE,
  store_id         INTEGER NOT NULL REFERENCES stores (id),
  external_id      TEXT,                     -- Steam App ID / slug Epic
  store_url        TEXT    NOT NULL,
  original_price   INTEGER NOT NULL,
  current_price    INTEGER NOT NULL,
  discount_percent INTEGER NOT NULL DEFAULT 0,
  last_synced_at   INTEGER,
  UNIQUE (game_id, store_id)
);
CREATE INDEX idx_listings_store ON store_listings (store_id);

CREATE TABLE price_history (
  id               INTEGER PRIMARY KEY,
  listing_id       INTEGER NOT NULL REFERENCES store_listings (id) ON DELETE CASCADE,
  recorded_on      TEXT    NOT NULL,         -- YYYY-MM-DD (UTC)
  price            INTEGER NOT NULL,
  original_price   INTEGER NOT NULL,
  discount_percent INTEGER NOT NULL,
  UNIQUE (listing_id, recorded_on)
);

CREATE TABLE sync_runs (
  id          INTEGER PRIMARY KEY,
  started_at  INTEGER NOT NULL,
  finished_at INTEGER,
  status      TEXT    NOT NULL CHECK (status IN ('running', 'success', 'partial', 'failed')),
  checked     INTEGER NOT NULL DEFAULT 0,
  updated     INTEGER NOT NULL DEFAULT 0,
  message     TEXT
);
