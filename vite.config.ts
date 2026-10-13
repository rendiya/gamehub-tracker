import { cloudflare } from '@cloudflare/vite-plugin'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
// Plugin Cloudflare menjalankan worker/ (API + D1 lokal) bersama dev server React.
export default defineConfig({
  plugins: [react(), cloudflare()],
})
