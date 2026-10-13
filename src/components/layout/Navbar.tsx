import { Link } from 'react-router'
import type { FormEvent } from 'react'
import styles from './Navbar.module.css'

type NavbarProps = {
  onSearch?: (query: string) => void
  onFavoriteClick?: () => void
}

function Navbar({
  onSearch,
  onFavoriteClick,
}: NavbarProps) {
  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!onSearch) return

    const formData = new FormData(event.currentTarget)
    const value = formData.get('query')

    if (typeof value !== 'string') return

    const query = value.trim()

    if (query) {
      onSearch(query)
    }
  }

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <Link
          className={styles.logo}
          to="/"
          aria-label="GameHub, kembali ke beranda"
        >
          Game<span className={styles.logoAccent}>Hub</span>
        </Link>

        <form
          className={styles.search}
          role="search"
          onSubmit={handleSearch}
        >
          <button
            className={styles.searchButton}
            type="submit"
            aria-label="Cari game"
            disabled={!onSearch}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              aria-hidden="true"
            >
              <circle cx="10.5" cy="10.5" r="6.5" />
              <path d="m15.5 15.5 4.5 4.5" />
            </svg>
          </button>

          <input
            className={styles.searchInput}
            type="search"
            name="query"
            placeholder="Cari..."
            aria-label="Cari game"
            disabled={!onSearch}
          />
        </form>

        <nav
          className={styles.actions}
          aria-label="Navigasi utama"
        >
          <Link
            className={styles.actionButton}
            to="/catalog"
            aria-label="Buka katalog"
          >
            <svg
              className={styles.catalogIcon}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M3.5 8.5h17v12h-17z" />
              <path d="M7.5 8.5v-5h9v5" />
              <path d="M3.5 13h17" />
              <path d="M10 16v4.5" />
              <path d="M16 16v4.5" />
            </svg>

            <span className={styles.actionText}>Katalog</span>
          </Link>

          <button
            className={styles.actionButton}
            type="button"
            aria-label="Buka favorite"
            onClick={onFavoriteClick}
            disabled={!onFavoriteClick}
          >
            <svg
              className={styles.favoriteIcon}
              viewBox="0 0 24 24"
              fill="rgba(244, 91, 133, 0.2)"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21.2l8.8-8.8a5.5 5.5 0 0 0 0-7.8Z" />
            </svg>

            <span className={styles.actionText}>Favorite</span>
          </button>        </nav>
      </div>
    </header>
  )
}

export default Navbar
