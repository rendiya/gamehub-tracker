import { useEffect, useState } from 'react'

const STORAGE_KEY = 'gamehub:favorites:v1'

function readFavorites(): string[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []

    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []

    return [...new Set(parsed.filter((id): id is string => typeof id === 'string'))]
  } catch {
    // Aplikasi tetap berfungsi bila browser memblokir penyimpanan lokal.
    return []
  }
}

export function useFavorites() {
  const [favoriteIds, setFavoriteIds] = useState<string[]>(readFavorites)

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(favoriteIds))
    } catch {
      // Tetap bisa dipakai di sesi aktif meskipun penyimpanan gagal.
    }
  }, [favoriteIds])

  useEffect(() => {
    const syncFromOtherTab = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY) setFavoriteIds(readFavorites())
    }
    window.addEventListener('storage', syncFromOtherTab)
    return () => window.removeEventListener('storage', syncFromOtherTab)
  }, [])

  const toggleFavorite = (gameId: string) => {
    setFavoriteIds((current) =>
      current.includes(gameId)
        ? current.filter((id) => id !== gameId)
        : [...current, gameId],
    )
  }

  return { favoriteIds, toggleFavorite }
}
