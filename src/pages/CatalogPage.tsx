import { useState } from 'react'
import { Link, useSearchParams } from 'react-router'

import CatalogFilters from '../components/catalog/CatalogFilters'
import Pagination from '../components/catalog/Pagination'
import SortDropdown, { type CatalogSort } from '../components/catalog/SortDropdown'
import GameGrid from '../components/store/GameGrid'
import { catalogGames } from '../data/catalogGames'
import type { GenreFilter, ShopFilter } from '../data/catalogOptions'
import type { StoreId } from '../types/game'
import styles from './CatalogPage.module.css'
import searchStyles from './CatalogSearch.module.css'

const PAGE_SIZE = 6

const STORE_DETAILS: Record<StoreId, { title: string; description: string }> = {
  steam: {
    title: 'Steam',
    description: 'Temukan berbagai game Steam dan lihat harga serta promo yang tersedia.',
  },
  epic: {
    title: 'Epic Games Store',
    description: 'Temukan berbagai game Epic Games Store dan lihat harga serta promo yang tersedia.',
  },
}

type CatalogPageProps = {
  favoriteIds: readonly string[]
  onToggleFavorite: (gameId: string) => void
  fixedStore?: StoreId
}

function CatalogPage({ favoriteIds, onToggleFavorite, fixedStore }: CatalogPageProps) {
  const [searchParams] = useSearchParams()
  const query = (searchParams.get('q') ?? '').trim()
  const normalizedQuery = query.toLocaleLowerCase('id-ID')
  const isSearching = normalizedQuery.length > 0

  // Store page: toko asal dipilih terlebih dahulu. Pengguna tetap boleh mengganti
  // atau menambah filter Shops seperti di halaman Katalog.
  // Saat mencari, semua filter awal dikosongkan agar game yang dicari tidak tersembunyi.
  const [shops, setShops] = useState<ShopFilter[]>(isSearching ? [] : [fixedStore ?? 'steam'])
  const [genres, setGenres] = useState<GenreFilter[]>(isSearching ? [] : ['Action'])
  const [sort, setSort] = useState<CatalogSort>('latest')
  const [page, setPage] = useState(1)

  const filtered = catalogGames.filter((game) => {
    const matchesStore = shops.length === 0 || shops.includes(game.store)
    const matchesGenre = genres.length === 0 || genres.some((genre) =>
      game.genres.some((item) => item.toLocaleLowerCase('id-ID') === genre.toLocaleLowerCase('id-ID')),
    )
    const storeLabel = game.store === 'steam' ? 'Steam' : 'Epic Games Store'
    const searchable = [game.title, storeLabel, ...game.genres].join(' ').toLocaleLowerCase('id-ID')
    const matchesSearch = !isSearching || searchable.includes(normalizedQuery)

    return matchesStore && matchesGenre && matchesSearch
  })

  const sorted = [...filtered].sort((a, b) => {
    if (sort === 'lowest') return a.currentPrice - b.currentPrice
    if (sort === 'discount') {
      const discountA = a.originalPrice > 0 ? 1 - a.currentPrice / a.originalPrice : 0
      const discountB = b.originalPrice > 0 ? 1 - b.currentPrice / b.originalPrice : 0
      return discountB - discountA
    }
    // 'latest' mengikuti urutan data hingga API menyediakan timestamp yang sah.
    // 'bestseller' dinonaktifkan pada SortDropdown karena data penjualan belum tersedia.
    return 0
  })

  const totalPages = Math.ceil(sorted.length / PAGE_SIZE)
  const safePage = Math.max(1, Math.min(page, totalPages || 1))
  const visibleGames = sorted.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  const toggleShop = (shop: ShopFilter) => {
    setShops((current) =>
      current.includes(shop) ? current.filter((item) => item !== shop) : [...current, shop],
    )
    setPage(1)
  }

  const toggleGenre = (genre: GenreFilter) => {
    setGenres((current) =>
      current.includes(genre) ? current.filter((item) => item !== genre) : [...current, genre],
    )
    setPage(1)
  }

  const heading = fixedStore
    ? STORE_DETAILS[fixedStore]
    : {
        title: 'Katalog Game',
        description: 'Temukan berbagai game dan bandingkan harga dari beberapa platform',
      }

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        {fixedStore && (
          <Link className={styles.backLink} to="/">
            <span aria-hidden="true">←</span> Kembali
          </Link>
        )}

        <div className={styles.heading}>
          <div>
            <h1>{heading.title}</h1>
            <p>{heading.description}</p>
          </div>
          <SortDropdown
            value={sort}
            onChange={(next) => { setSort(next); setPage(1) }}
          />
        </div>

        <div className={styles.divider} aria-hidden="true" />

        {isSearching && (
          <div className={searchStyles.searchContext}>
            <span>Hasil pencarian untuk <strong>“{query}”</strong></span>
          </div>
        )}

        <div className={styles.layout}>
          <CatalogFilters
            selectedShops={shops}
            selectedGenres={genres}
            onShopToggle={toggleShop}
            onGenreToggle={toggleGenre}
          />
          <section className={styles.results} aria-label={`Hasil ${heading.title}`}>
            <p className={styles.resultCount} role="status">
              {filtered.length} hasil ditemukan
            </p>
            {visibleGames.length ? (
              <GameGrid
                className={styles.grid}
                games={visibleGames}
                favoriteIds={favoriteIds}
                onToggleFavorite={onToggleFavorite}
              />
            ) : (
              <div className={styles.empty}>
                <h2 className={searchStyles.emptyTitle}>Tidak ada game yang cocok</h2>
                <p className={searchStyles.emptyText}>
                  {isSearching
                    ? 'Coba kata kunci lain atau ubah pilihan Shops dan Genre.'
                    : 'Coba ubah pilihan Shops dan Genre untuk melihat game lainnya.'}
                </p>
                <div className={searchStyles.emptyActions}>
                  <button
                    className={searchStyles.resetButton}
                    type="button"
                    onClick={() => { setShops([]); setGenres([]); setPage(1) }}
                  >
                    Reset filter
                  </button>
                </div>
              </div>
            )}
            <Pagination page={safePage} totalPages={totalPages} onPageChange={setPage} />
          </section>
        </div>
      </div>
    </main>
  )
}

export default CatalogPage