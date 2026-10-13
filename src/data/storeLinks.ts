import type { StoreId } from '../types/game'

// Dummy tautan ke halaman toko. Game tanpa slug/App ID diarahkan ke pencarian di toko tersebut.
const steamAppIds: Record<string, number> = {
  'battlefield-6': 2807960,
  'detroit-become-human': 1222140,
  'sekiro-shadows-die-twice': 814380,
  'red-dead-redemption-2': 1174180,
}

const epicSlugs: Record<string, string> = {
  'battlefield-6': 'battlefield-6',
  'detroit-become-human': 'detroit-become-human',
  'sekiro-shadows-die-twice': 'sekiro-shadows-die-twice',
  'red-dead-redemption-2': 'red-dead-redemption-2',
}

export function getStoreUrl(store: StoreId, gameId: string, title: string): string {
  if (store === 'steam') {
    const appId = steamAppIds[gameId]
    return appId
      ? `https://store.steampowered.com/app/${appId}/`
      : `https://store.steampowered.com/search/?term=${encodeURIComponent(title)}`
  }

  const slug = epicSlugs[gameId]
  return slug
    ? `https://store.epicgames.com/en-US/p/${slug}`
    : `https://store.epicgames.com/en-US/browse?q=${encodeURIComponent(title)}`
}
