import {
  GENRES,
  SHOPS,
  type GenreFilter,
  type ShopFilter,
} from '../../data/catalogOptions'
import styles from './CatalogFilters.module.css'

type CatalogFiltersProps = {
  selectedShops: readonly ShopFilter[]
  selectedGenres: readonly GenreFilter[]
  onShopToggle: (shop: ShopFilter) => void
  onGenreToggle: (genre: GenreFilter) => void
}

const SHOP_LABELS: Record<ShopFilter, string> = {
  steam: 'Steam',
  epic: 'Epic',
  gog: 'GOG',
}

function CatalogFilters({
  selectedShops,
  selectedGenres,
  onShopToggle,
  onGenreToggle,
}: CatalogFiltersProps) {
  return (
    <aside className={styles.panel} aria-label="Filter katalog">
      <h2 className={styles.title}>Filters</h2>

      <fieldset className={styles.group}>
        <legend className={styles.legend}>Shops</legend>
        <div className={styles.options}>
          {SHOPS.map((shop) => (
            <label className={styles.option} key={shop}>
              <input
                type="checkbox"
                checked={selectedShops.includes(shop)}
                onChange={() => onShopToggle(shop)}
              />
              <span>{SHOP_LABELS[shop]}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className={styles.group}>
        <legend className={styles.legend}>Genre</legend>
        <div className={styles.options}>
          {GENRES.map((genre) => (
            <label className={styles.option} key={genre}>
              <input
                type="checkbox"
                checked={selectedGenres.includes(genre)}
                onChange={() => onGenreToggle(genre)}
              />
              <span>{genre}</span>
            </label>
          ))}
        </div>
      </fieldset>
    </aside>
  )
}

export default CatalogFilters