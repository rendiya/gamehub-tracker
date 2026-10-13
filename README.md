# GameHub

Bandingkan harga game dari Steam dan Epic Games Store, lengkap dengan riwayat diskon.

Frontend React + backend API berjalan dalam **satu Cloudflare Worker**, dengan database **D1**.
Setiap push ke `main` otomatis di-build dan di-deploy oleh Cloudflare Workers Builds.

## Struktur

```
src/          Frontend React (Vite)
worker/       Backend: Hono API + cron sinkronisasi harga
  routes/     Definisi endpoint /api/*
  services/   Logika katalog, detail, riwayat harga, sync Steam
  db/         Skema Drizzle (cerminan migrations/)
shared/       Tipe respons API, dipakai worker/ dan src/
migrations/   SQL D1: skema + data demo
public/games/ Gambar game yang path-nya disimpan di database
wrangler.jsonc  Konfigurasi Worker, D1, cron
```

## Menjalankan di lokal

```bash
npm install
npm run db:migrate:local   # buat database D1 lokal + data demo
npm run dev                # http://localhost:5173 (frontend + /api)
```

Menjalankan cron secara manual saat `npm run dev`:
`curl "http://localhost:5173/cdn-cgi/handler/scheduled"`

## API

| Method | Endpoint | Keterangan |
|---|---|---|
| GET | `/api/health` | Status Worker, D1, dan sync terakhir |
| GET | `/api/home` | Daftar game per toko untuk beranda |
| GET | `/api/games` | Katalog. Query: `q`, `stores=steam,epic`, `genres=action,rpg`, `sort=latest\|discount\|lowest`, `page`, `pageSize` (maks 48) |
| GET | `/api/games/:gameId` | Detail game, galeri, spesifikasi, harga di tiap toko |
| GET | `/api/games/:gameId/price-history` | Query: `store=steam\|epic`, `days` (1–365, default 30) |
| GET | `/api/stores` | Daftar toko |
| GET | `/api/genres` | Daftar genre |

Error selalu berbentuk `{ "error": { "code", "message" } }`.

Cron (`0 */6 * * *`) mengambil harga Rupiah dari Steam dan mencatat titik riwayat harian.
Harga Epic diambil dari data seed karena Epic tidak menyediakan API harga publik.

## Deploy pertama (sekali saja)

1. Login dan buat database:
   ```bash
   npx wrangler login
   npx wrangler d1 create gamehub-db
   ```
2. Salin `database_id` dari output ke `wrangler.jsonc`, lalu commit dan push.
3. Di dashboard Cloudflare: **Workers & Pages → Create → Import a repository**, pilih repo ini.
   - Build command: `npm run build`
   - Deploy command: `npm run deploy`
4. Setelah itu setiap push ke `main` otomatis deploy. Branch lain mendapat URL preview.

## Mengubah data

Jangan mengedit migration yang sudah ter-deploy. Buat file baru, mis. `migrations/0003_tambah_game.sql`,
lalu push. Migration baru dijalankan otomatis saat deploy.

Setelah mengubah `wrangler.jsonc`, jalankan `npm run cf-typegen` untuk memperbarui tipe binding.
