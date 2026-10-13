
import type { GameCardData } from '../../types/game'
import styles from './GameCard.module.css'
import epicIcon from '../../assets/epic-games.svg'

type GameCardProps = {
  game: GameCardData
  isFavorite?: boolean
  onToggleFavorite?: (game: GameCardData) => void
}

const priceFormatter = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
})

function GameCard({
  game,
  isFavorite = false,
  onToggleFavorite,
}: GameCardProps) {
  const discountPercent =
    game.originalPrice > 0 &&
    game.currentPrice < game.originalPrice
      ? Math.round(
          (1 - game.currentPrice / game.originalPrice) * 100
        )
      : 0

  const storeName =
    game.store === 'steam' ? 'Steam' : 'Epic Games Store'

  // const storeBadgeLabel =
  //   game.store === 'steam' ? 'Steam' : 'Epic'

  return (
    <article className={styles.card}>
      <div className={styles.media}>
        <img
          className={styles.cover}
          src={game.coverSrc}
          alt={`Cover game ${game.title}`}
          loading="lazy"
          decoding="async"
        />

        <button
          className={styles.favoriteButton}
          type="button"
          aria-label={
            isFavorite
              ? `Hapus ${game.title} dari favorit`
              : `Tambahkan ${game.title} ke favorit`
          }
          aria-pressed={isFavorite}
          onClick={() => onToggleFavorite?.(game)}
          disabled={!onToggleFavorite}
        >
          <svg
            viewBox="0 0 24 24"
            width="24"
            height="24"
            fill={isFavorite ? 'currentColor' : 'none'}
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21.2l8.8-8.8a5.5 5.5 0 0 0 0-7.8Z" />
          </svg>
        </button>
        {discountPercent > 0 && (
          <div className={styles.discountBadge}>
            {game.store === 'steam' ? (
              <svg
                className={styles.storeIcon}
                viewBox="0 0 16 16"
                fill="currentColor"
                role="img"
                aria-label={storeName}
              >
                <path d="M.329 10.333A8.01 8.01 0 0 0 7.99 16C12.414 16 16 12.418 16 8s-3.586-8-8.009-8A8.006 8.006 0 0 0 0 7.468l.003.006 4.304 1.769A2.2 2.2 0 0 1 5.62 8.88l1.96-2.844-.001-.04a3.046 3.046 0 0 1 3.042-3.043 3.046 3.046 0 0 1 3.042 3.043 3.047 3.047 0 0 1-3.111 3.044l-2.804 2a2.223 2.223 0 0 1-3.075 2.11 2.22 2.22 0 0 1-1.312-1.568L.33 10.333Z" />
                <path d="M4.868 12.683a1.715 1.715 0 0 0 1.318-3.165 1.7 1.7 0 0 0-1.263-.02l1.023.424a1.261 1.261 0 1 1-.97 2.33l-.99-.41a1.7 1.7 0 0 0 .882.84Zm3.726-6.687a2.03 2.03 0 0 0 2.027 2.029 2.03 2.03 0 0 0 2.027-2.029 2.03 2.03 0 0 0 2.027-2.027 2.03 2.03 0 0 0-2.027-2.027 2.03 2.03 0 0 0-2.027 2.027m2.03-1.527a1.524 1.524 0 1 1-.002 3.048 1.524 1.524 0 0 1 .002-3.048" />
              </svg>
            ) : (
              <span className={styles.storeLabel}>
                <img
                  className={styles.epicIcon}
                  src={epicIcon}
                  alt="Epic Games Store"
                  width={28}
                  height={28}
                />
              </span>
            )}

            <span className={styles.discountValue}>
              {discountPercent}%
            </span>
          </div>
        )}

      </div>

      <div className={styles.body}>
        <h3 className={styles.title} title={game.title}>
          {game.title}
        </h3>

        {discountPercent > 0 && (
          <p className={styles.originalPrice}>
            <s>{priceFormatter.format(game.originalPrice)}</s>
          </p>
        )}

        <p className={styles.currentPrice}>
          {priceFormatter.format(game.currentPrice)}
        </p>

        {game.rating !== null && (
          <p
            className={styles.rating}
            aria-label={`Rating ${game.rating} dari 10`}
          >
            <span aria-hidden="true">★</span>
            <span>{game.rating.toFixed(1)}</span>
          </p>
        )}

        {game.genres.length > 0 && (
          <ul
            className={styles.genres}
            aria-label="Genre game"
          >
            {game.genres.map((genre) => (
              <li className={styles.genre} key={genre}>
                {genre}
              </li>
            ))}
          </ul>
        )}
      </div>
    </article>
  )
}

export default GameCard
