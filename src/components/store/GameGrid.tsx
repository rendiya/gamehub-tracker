import type { GameCardData } from '../../types/game'
import NavigableGameCard from './NavigableGameCard'

type GameGridProps = {
  games: readonly GameCardData[]
  favoriteIds: readonly string[]
  onToggleFavorite: (gameId: string) => void
  className: string
}

function GameGrid({ games, favoriteIds, onToggleFavorite, className }: GameGridProps) {
  return (
    <div className={className}>
      {games.map((game) => (
        <NavigableGameCard
          key={`${game.store}:${game.id}`}
          game={game}
          isFavorite={favoriteIds.includes(game.id)}
          onToggleFavorite={(selectedGame) => onToggleFavorite(selectedGame.id)}
        />
      ))}
    </div>
  )
}

export default GameGrid