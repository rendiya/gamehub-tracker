import type { GameCardData } from '../types/game'
import { epicPreviewGames, steamPreviewGames } from './demoGames'

// Data antarmuka sementara. Ganti sumbernya dengan respons API.
// Identitas game (id) sengaja sama di berbagai toko.
export const catalogGames: readonly GameCardData[] = [
  ...steamPreviewGames,
  ...epicPreviewGames,
]
