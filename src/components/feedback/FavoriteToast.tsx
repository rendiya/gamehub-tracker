import { useEffect, useState } from 'react'
import styles from './FavoriteToast.module.css'

export type FavoriteNotice = {
  id: number
  action: 'added' | 'removed'
}

type FavoriteToastProps = {
  notices: readonly FavoriteNotice[]
  onDismiss: (id: number) => void
}

type ToastItemProps = {
  notice: FavoriteNotice
  onDismiss: (id: number) => void
}

const DISPLAY_MS = 3000
const EXIT_MS = 200
const MAX_VISIBLE = 3

function ToastItem({ notice, onDismiss }: ToastItemProps) {
  const [closing, setClosing] = useState(false)

  // Timer baru dimulai ketika toast benar-benar tampil, bukan saat masih antre.
  useEffect(() => {
    const timer = window.setTimeout(() => setClosing(true), DISPLAY_MS)
    return () => window.clearTimeout(timer)
  }, [notice.id])

  // Tunggu animasi menghilang selesai sebelum menghapusnya dari antrean.
  useEffect(() => {
    if (!closing) return

    const timer = window.setTimeout(() => onDismiss(notice.id), EXIT_MS)
    return () => window.clearTimeout(timer)
  }, [closing, notice.id, onDismiss])

  const message = notice.action === 'added'
    ? 'Ditambahkan ke Favorit!'
    : 'Dihapus dari Favorit!'

  return (
    <div
      className={`${styles.toast} ${closing ? styles.closing : ''}`}
      role="status"
      aria-atomic="true"
    >
      <svg className={styles.heart} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21.2l8.8-8.8a5.5 5.5 0 0 0 0-7.8Z" />
      </svg>

      <span className={styles.message}>{message}</span>

      <button
        className={styles.close}
        type="button"
        aria-label="Tutup notifikasi favorit"
        onClick={() => setClosing(true)}
        disabled={closing}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
          <path d="M5 5 19 19M19 5 5 19" />
        </svg>
      </button>

      <div className={styles.track} aria-hidden="true">
        <div className={styles.progress} />
      </div>
    </div>
  )
}

function FavoriteToast({ notices, onDismiss }: FavoriteToastProps) {
  if (notices.length === 0) return null

  return (
    <div className={styles.viewport} aria-label="Notifikasi favorit">
      {notices.slice(0, MAX_VISIBLE).map((notice) => (
        <ToastItem key={notice.id} notice={notice} onDismiss={onDismiss} />
      ))}
    </div>
  )
}

export default FavoriteToast