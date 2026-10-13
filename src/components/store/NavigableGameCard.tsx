import { Link, useLocation } from 'react-router'
import type { GameCardData } from '../../types/game'
import GameCard from './GameCard'
import styles from './NavigableGameCard.module.css'

type NavigableGameCardProps = {
  game: GameCardData
  isFavorite: boolean
  onToggleFavorite: (game: GameCardData) => void
}

/**
 * Menggunakan GameCard lama tanpa menyentuh JSX/CSS-nya.
 * Link ditempatkan di atas kartu, KECUALI zona hati kanan atas.
 * Ini mencegah klik favorit ikut membuka halaman detail.
 */
function NavigableGameCard({ game, isFavorite, onToggleFavorite }: NavigableGameCardProps) {
  const location = useLocation()
  const from = `${location.pathname}${location.search}`

  return (
    <div className={styles.card}>
      <GameCard
        game={game}
        isFavorite={isFavorite}
        onToggleFavorite={onToggleFavorite}
      />
      <Link
        className={styles.openDetail}
        to={`/games/${encodeURIComponent(game.id)}`}
        state={{ from }}
        aria-label={`Lihat detail ${game.title}`}
      />
    </div>
  )
}

export default NavigableGameCard