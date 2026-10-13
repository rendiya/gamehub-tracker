import app from './app'
import { getDb } from './db/client'
import { runPriceSync } from './services/steamSync'

export default {
  fetch: app.fetch,

  // Dipanggil oleh Cron Trigger di wrangler.jsonc.
  async scheduled(_controller, env, ctx) {
    ctx.waitUntil(
      runPriceSync(getDb(env)).then((result) => console.log('price sync', JSON.stringify(result))),
    )
  },
} satisfies ExportedHandler<Env>
