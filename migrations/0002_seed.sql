-- Data demo, disalin dari src/data/*.ts agar API dan tampilan sekarang konsisten.
-- Untuk mengubah data di production: tambahkan migration baru (0003_...), jangan ubah file ini
-- setelah ter-deploy, karena D1 tidak menjalankan ulang migration yang sudah tercatat.

INSERT INTO stores (id, code, name, is_active, sort_order) VALUES
  (1, 'steam', 'Steam',            1, 1),
  (2, 'epic',  'Epic Games Store', 1, 2),
  (3, 'gog',   'GOG',              0, 3);

INSERT INTO genres (id, slug, name) VALUES
  (1,  'action',      'Action'),
  (2,  'rpg',         'RPG'),
  (3,  'adventure',   'Adventure'),
  (4,  'strategy',    'Strategy'),
  (5,  'simulation',  'Simulation'),
  (6,  'racing',      'Racing'),
  (7,  'sports',      'Sports'),
  (8,  'indie',       'Indie'),
  (9,  'fps',         'FPS'),
  (10, 'interactive', 'Interactive'),
  (11, 'open-world',  'Open World');

-- created_at menurun mengikuti urutan data demo, sehingga sort "Terbaru" sama dengan urutan sekarang.
INSERT INTO games (id, title, cover_path, hero_path, description, rating, created_at) VALUES
  ('battlefield-6', 'Battlefield 6',
   '/games/battlefield-6/cover.png', NULL, NULL, 6.8, 1760000400000),
  ('detroit-become-human', 'Detroit: Become Human',
   '/games/detroit-become-human/cover.webp', NULL, NULL, 8.7, 1760000300000),
  ('sekiro-shadows-die-twice', 'Sekiro: Shadows Die Twice',
   '/games/sekiro-shadows-die-twice/cover.webp', NULL, NULL, 8.9, 1760000200000),
  ('red-dead-redemption-2', 'Red Dead Redemption 2',
   '/games/red-dead-redemption-2/cover.webp', '/games/red-dead-redemption-2/hero.webp',
   'Amerika, tahun 1899. Arthur Morgan dan Van der Linde Gang adalah pelanggar hukum yang kabur. Diikuti agen federal dan pemburu hadiah terbaik di negaranya, mereka harus merampok, mencuri, dan bertarung di sepanjang jalan daratan liar Amerika guna bertahan hidup. Seiring perpecahan internal makin mengancam kelangsungan geng, Arthur harus memilih antara idealismenya dengan kesetiaannya terhadap geng yang membesarkannya.' || char(10) || char(10) ||
   'Pemenang lebih dari 175 Game of the Year Award dan penerima lebih dari 250 skor sempurna, Red Dead Redemption 2 adalah kisah epik tentang kehormatan dan kesetiaan di awal masa modern.' || char(10) || char(10) ||
   'Red Dead Redemption 2 juga mencakup Red Dead Online — pengalaman multiplayer yang mengambil tempat di semesta Red Dead Redemption 2 — bermain sendiri atau bentuk kelompok; jalankan bar; kalahkan penegak hukum, geng pelanggar hukum, hewan liar yang buas, dan masih banyak lagi seiring menempuh jalan pribadi di perbatasan Amerika.',
   9.0, 1760000100000);

INSERT INTO game_genres (game_id, genre_id, sort_order) VALUES
  ('battlefield-6',            9,  0),
  ('battlefield-6',            1,  1),
  ('detroit-become-human',     3,  0),
  ('detroit-become-human',     10, 1),
  ('sekiro-shadows-die-twice', 1,  0),
  ('sekiro-shadows-die-twice', 11, 1),
  ('red-dead-redemption-2',    1,  0),
  ('red-dead-redemption-2',    11, 1);

-- Video gameplay belum disertakan (file aslinya 138 MB, melebihi batas aset Workers 25 MiB),
-- jadi item video hanya menampilkan poster.
INSERT INTO game_media (id, game_id, kind, path, poster_path, alt, sort_order) VALUES
  ('rdr2-video',   'red-dead-redemption-2', 'video', NULL,
   '/games/red-dead-redemption-2/preview-1.webp', 'Pratinjau video Red Dead Redemption 2', 0),
  ('rdr2-image-1', 'red-dead-redemption-2', 'image',
   '/games/red-dead-redemption-2/preview-2.webp', NULL, 'Arthur Morgan saat beraksi', 1),
  ('rdr2-image-2', 'red-dead-redemption-2', 'image',
   '/games/red-dead-redemption-2/preview-3.webp', NULL, 'Arthur Morgan menunggang kuda di sebuah permukiman', 2);

INSERT INTO system_requirements (game_id, tier, label, value, sort_order) VALUES
  ('red-dead-redemption-2', 'minimum', 'Arsitektur',  'Prosesor 64-bit dan OS diperlukan', 0),
  ('red-dead-redemption-2', 'minimum', 'OS',          'Windows 10 - 64-bit', 1),
  ('red-dead-redemption-2', 'minimum', 'Prosesor',    'Intel® Core™ i5-2500K / AMD FX-6300', 2),
  ('red-dead-redemption-2', 'minimum', 'Memori',      '8 GB RAM', 3),
  ('red-dead-redemption-2', 'minimum', 'Grafis',      'Nvidia GeForce GTX 770 2GB / AMD Radeon R9 280 3GB', 4),
  ('red-dead-redemption-2', 'minimum', 'Jaringan',    'Koneksi Internet Broadband', 5),
  ('red-dead-redemption-2', 'minimum', 'Penyimpanan', '150 GB ruang tersedia', 6),
  ('red-dead-redemption-2', 'minimum', 'Kartu suara', 'Direct X Compatible', 7),
  ('red-dead-redemption-2', 'recommended', 'Arsitektur',  'Prosesor 64-bit dan OS diperlukan', 0),
  ('red-dead-redemption-2', 'recommended', 'OS',          'Windows 10 - 64-bit', 1),
  ('red-dead-redemption-2', 'recommended', 'Prosesor',    'Intel® Core™ i7-4770K / AMD Ryzen 5 1500X', 2),
  ('red-dead-redemption-2', 'recommended', 'Memori',      '12 GB RAM', 3),
  ('red-dead-redemption-2', 'recommended', 'Grafis',      'Nvidia GeForce GTX 1060 6GB / AMD Radeon RX 480 4GB', 4),
  ('red-dead-redemption-2', 'recommended', 'Jaringan',    'Koneksi Internet Broadband', 5),
  ('red-dead-redemption-2', 'recommended', 'Penyimpanan', '150 GB ruang tersedia', 6),
  ('red-dead-redemption-2', 'recommended', 'Kartu suara', 'Direct X Compatible', 7);

INSERT INTO store_listings
  (id, game_id, store_id, external_id, store_url, original_price, current_price, discount_percent) VALUES
  (1, 'battlefield-6',            1, '2807960', 'https://store.steampowered.com/app/2807960/', 1251888, 625854, 50),
  (2, 'detroit-become-human',     1, '1222140', 'https://store.steampowered.com/app/1222140/', 1251888, 625854, 50),
  (3, 'sekiro-shadows-die-twice', 1, '814380',  'https://store.steampowered.com/app/814380/',  1251888, 625854, 50),
  (4, 'red-dead-redemption-2',    1, '1174180', 'https://store.steampowered.com/app/1174180/', 1073021, 268121, 75),
  (5, 'battlefield-6',            2, 'battlefield-6',            'https://store.epicgames.com/en-US/p/battlefield-6',            1251888, 625854, 50),
  (6, 'detroit-become-human',     2, 'detroit-become-human',     'https://store.epicgames.com/en-US/p/detroit-become-human',     1251888, 625854, 50),
  (7, 'sekiro-shadows-die-twice', 2, 'sekiro-shadows-die-twice', 'https://store.epicgames.com/en-US/p/sekiro-shadows-die-twice', 1251888, 625854, 50),
  (8, 'red-dead-redemption-2',    2, 'red-dead-redemption-2',    'https://store.epicgames.com/en-US/p/red-dead-redemption-2',    1073021, 268121, 75);

-- Riwayat 30 hari terakhir dihitung relatif terhadap tanggal migration dijalankan,
-- supaya grafik langsung terisi saat demo. Pola diskon meniru buildDummyPriceHistory
-- (lebih sering 0%). Titik hari ini = harga listing sekarang. Setelah itu cron menambah titik baru.
WITH RECURSIVE
  days(n) AS (SELECT 0 UNION ALL SELECT n + 1 FROM days WHERE n < 29),
  steps(i, pct) AS (
    VALUES (0, 0), (1, 0), (2, 0), (3, 10), (4, 15), (5, 20), (6, 25),
           (7, 33), (8, 40), (9, 50), (10, 60), (11, 67), (12, 75)
  )
INSERT INTO price_history (listing_id, recorded_on, price, original_price, discount_percent)
SELECT
  l.id,
  date('now', '-' || d.n || ' days'),
  CASE WHEN d.n = 0 THEN l.current_price
       ELSE CAST(round(l.original_price * (100 - s.pct) / 100.0) AS INTEGER) END,
  l.original_price,
  CASE WHEN d.n = 0 THEN l.discount_percent ELSE s.pct END
FROM store_listings l
CROSS JOIN days d
JOIN steps s ON s.i = (l.id * 7 + d.n * (l.id + 4) + (d.n * d.n * l.id) % 7) % 13;
