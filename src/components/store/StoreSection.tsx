
import type { GameCardData, StoreId } from '../../types/game'
import NavigableGameCard from './NavigableGameCard'
import styles from './StoreSection.module.css'

type StoreSectionProps = {
  store: StoreId
  games?: readonly GameCardData[]
  favoriteIds: readonly string[]
  onToggleFavorite: (gameId: string) => void
  onMoreClick?: (store: StoreId) => void
}

const storeTitles: Record<StoreId, string> = {
  steam: 'Steam',
  epic: 'Epic Games Store',
}

function StoreSection({
  store,
  games = [],
  favoriteIds,
  onToggleFavorite,
  onMoreClick,
}: StoreSectionProps) {
  const headingId = `${store}-section-title`

  return (
    <section
      className={styles.section}
      aria-labelledby={headingId}
    >
      <h2 id={headingId} className={styles.title}>
        {storeTitles[store]}
      </h2>

      <div
        className={styles.divider}
        aria-hidden="true"
      />

      {games.length > 0 && (
        <>
          <div className={styles.games}>
            {games.map((game) => (
              <NavigableGameCard
                key={`${game.store}-${game.id}`}
                game={game}
                isFavorite={favoriteIds.includes(game.id)}
                onToggleFavorite={(selectedGame) => onToggleFavorite(selectedGame.id)}
              />
            ))}
          </div>

          <div className={styles.footer}>
            <div
              className={styles.footerLine}
              aria-hidden="true"
            />

            <button
              className={styles.moreButton}
              type="button"
              onClick={() => onMoreClick?.(store)}
              disabled={!onMoreClick}
            >
              More...
            </button>
          </div>
        </>
      )}
    </section>
  )
}

export default StoreSection