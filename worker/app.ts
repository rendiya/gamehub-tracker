import { Hono } from 'hono'
import { HTTPException } from 'hono/http-exception'

import type { ApiError } from '../shared/types'
import games from './routes/games'
import health from './routes/health'
import home from './routes/home'
import meta from './routes/meta'

export type AppEnv = { Bindings: Env }

const app = new Hono<AppEnv>().basePath('/api')

app.route('/', health)
app.route('/', home)
app.route('/', meta)
app.route('/games', games)

app.notFound((c) =>
  c.json<ApiError>({ error: { code: 'not_found', message: `Endpoint ${c.req.path} tidak ditemukan` } }, 404),
)

app.onError((error, c) => {
  if (error instanceof HTTPException) {
    return c.json<ApiError>({ error: { code: 'bad_request', message: error.message } }, error.status)
  }
  console.error(error)
  return c.json<ApiError>({ error: { code: 'internal_error', message: 'Terjadi kesalahan pada server' } }, 500)
})

export default app
