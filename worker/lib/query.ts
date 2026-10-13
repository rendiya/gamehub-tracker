import { HTTPException } from 'hono/http-exception'

// Parser query string kecil agar tidak perlu library validasi untuk endpoint read-only.

export function parseList(value: string | undefined): string[] {
  if (!value) return []
  return [...new Set(value.split(',').map((item) => item.trim().toLowerCase()).filter(Boolean))]
}

export function parseIntInRange(
  value: string | undefined,
  name: string,
  { min, max, fallback }: { min: number; max: number; fallback: number },
): number {
  if (value === undefined || value === '') return fallback
  const parsed = Number(value)
  if (!Number.isInteger(parsed) || parsed < min || parsed > max) {
    throw new HTTPException(400, { message: `${name} harus bilangan bulat ${min}–${max}` })
  }
  return parsed
}

export function parseEnum<T extends string>(
  value: string | undefined,
  name: string,
  allowed: readonly T[],
  fallback: T,
): T {
  if (value === undefined || value === '') return fallback
  if (!(allowed as readonly string[]).includes(value)) {
    throw new HTTPException(400, { message: `${name} harus salah satu dari: ${allowed.join(', ')}` })
  }
  return value as T
}
