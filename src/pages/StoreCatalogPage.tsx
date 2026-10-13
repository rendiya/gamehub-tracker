import { Navigate, useParams } from 'react-router'
import CatalogPage from './CatalogPage'

type StoreCatalogPageProps = {
  favoriteIds: readonly string[]
  onToggleFavorite: (gameId: string) => void
}

function StoreCatalogPage({ favoriteIds, onToggleFavorite }: StoreCatalogPageProps) {
  const { storeId } = useParams<'storeId'>()

  if (storeId !== 'steam' && storeId !== 'epic') {
    return <Navigate to="/catalog" replace />
  }

  return (
    <CatalogPage
      key={storeId}
      fixedStore={storeId}
      favoriteIds={favoriteIds}
      onToggleFavorite={onToggleFavorite}
    />
  )
}

export default StoreCatalogPage
