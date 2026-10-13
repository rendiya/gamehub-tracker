import { useNavigate } from 'react-router'

import Hero from '../components/home/Hero'
import SaleEvents from '../components/home/SaleEvents'
import StoreSection from '../components/store/StoreSection'
import { epicPreviewGames, steamPreviewGames } from '../data/demoGames'
import type { StoreId } from '../types/game'

type HomePageProps = {
  favoriteIds: readonly string[]
  onToggleFavorite: (gameId: string) => void
}

function HomePage({ favoriteIds, onToggleFavorite }: HomePageProps) {
  const navigate = useNavigate()
  const openStore = (store: StoreId) => navigate(`/stores/${store}`)

  return (
    <main>
      <Hero />
      <SaleEvents />

      <div id="steam">
        <StoreSection
          store="steam"
          games={steamPreviewGames}
          favoriteIds={favoriteIds}
          onToggleFavorite={onToggleFavorite}
          onMoreClick={openStore}
        />
      </div>

      <div id="epic">
        <StoreSection
          store="epic"
          games={epicPreviewGames}
          favoriteIds={favoriteIds}
          onToggleFavorite={onToggleFavorite}
          onMoreClick={openStore}
        />
      </div>
    </main>
  )
}

export default HomePage