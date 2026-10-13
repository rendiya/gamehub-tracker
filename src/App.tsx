import { useCallback, useRef, useState } from 'react'
import { Route, Routes, useLocation, useNavigate } from 'react-router'

import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import FavoriteToast, { type FavoriteNotice } from './components/feedback/FavoriteToast'
import { useFavorites } from './hooks/useFavorites'
import HomePage from './pages/HomePage'
import CatalogPage from './pages/CatalogPage'
import FavoritesPage from './pages/FavoritesPage'
import StoreCatalogPage from './pages/StoreCatalogPage'
import GameDetailPage from './pages/GameDetailPage'

function App() {
  const navigate = useNavigate()
  const location = useLocation()
  const { favoriteIds, toggleFavorite } = useFavorites()
  const [notices, setNotices] = useState<FavoriteNotice[]>([])
  const nextNoticeId = useRef(0)

  const handleFavoriteToggle = (gameId: string) => {
    const action = favoriteIds.includes(gameId) ? 'removed' : 'added'
    toggleFavorite(gameId)
    const id = ++nextNoticeId.current
    setNotices((current) => [...current, { id, action }])
  }

  const dismissNotice = useCallback((id: number) => {
    setNotices((current) => current.filter((item) => item.id !== id))
  }, [])

  const handleSearch = (query: string) => {
    const params = new URLSearchParams({ q: query.trim() })
    navigate(`/catalog?${params.toString()}`)
  }

  // Pertahankan keputusan layout sebelumnya: Navbar tidak ditampilkan di detail game.
  const isGameDetail = /^\/games\/[^/]+\/?$/.test(location.pathname)

  return (
    <>
      {!isGameDetail && (
        <Navbar
          onFavoriteClick={() => navigate('/favorites')}
          onSearch={handleSearch}
        />
      )}

      <Routes>
        <Route
          path="/"
          element={
            <HomePage
              favoriteIds={favoriteIds}
              onToggleFavorite={handleFavoriteToggle}
            />
          }
        />
        <Route
          path="/catalog"
          element={
            <CatalogPage
              key={location.search}
              favoriteIds={favoriteIds}
              onToggleFavorite={handleFavoriteToggle}
            />
          }
        />
        <Route
          path="/favorites"
          element={
            <FavoritesPage
              favoriteIds={favoriteIds}
              onToggleFavorite={handleFavoriteToggle}
            />
          }
        />
        <Route
          path="/stores/:storeId"
          element={
            <StoreCatalogPage
              favoriteIds={favoriteIds}
              onToggleFavorite={handleFavoriteToggle}
            />
          }
        />
        <Route path="/games/:gameId" element={<GameDetailPage />} />
      </Routes>

      <Footer />

      <FavoriteToast notices={notices} onDismiss={dismissNotice} />
    </>
  )
}

export default App