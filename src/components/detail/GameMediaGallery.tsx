import { useState } from 'react'
import type { GameMedia } from '../../data/gameDetails'
import styles from './GameMediaGallery.module.css'

type GameMediaGalleryProps = {
  title: string
  heroSrc: string
  hasWideHero: boolean
  gallery: readonly GameMedia[]
}

function GameMediaGallery({
  title,
  heroSrc,
  hasWideHero,
  gallery,
}: GameMediaGalleryProps) {
  // selectedId adalah pilihan tetap; hoveredId hanya preview sementara.
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [videoActive, setVideoActive] = useState(false)
  const [videoError, setVideoError] = useState(false)

  const selected = gallery.find((item) => item.id === selectedId)
  const preview = gallery.find((item) => item.id === hoveredId)

  // Hover tidak boleh menghentikan video yang sudah dipilih dan diputar.
  const activeMedia = videoActive ? selected : (preview ?? selected)
  const activeImage = activeMedia
    ? activeMedia.kind === 'image' ? activeMedia.src : activeMedia.poster
    : heroSrc
  const showVideo = videoActive && selected?.kind === 'video' && Boolean(selected.src) && !videoError
  const missingVideo = selected?.kind === 'video' && !selected.src && selectedId === activeMedia?.id

  const chooseMedia = (item: GameMedia) => {
    setSelectedId(item.id)
    setHoveredId(null)
    setVideoError(false)
    setVideoActive(item.kind === 'video' && Boolean(item.src))
  }

  const previewMedia = (item: GameMedia) => {
    if (!videoActive) setHoveredId(item.id)
  }

  return (
    <div className={styles.root}>
      <div className={styles.mainArtwork}>
        {showVideo && selected?.kind === 'video' && selected.src ? (
          <video
            key={selected.id}
            className={styles.video}
            controls
            autoPlay
            playsInline
            preload="metadata"
            poster={selected.poster}
            aria-label={`Video ${title}`}
            onError={() => setVideoError(true)}
          >
            <source src={selected.src} type="video/mp4" />
            Browser ini tidak mendukung pemutaran video MP4.
          </video>
        ) : (
          <img
            key={activeMedia?.id ?? 'hero'}
            className={`${styles.artwork} ${activeMedia || hasWideHero ? styles.artworkWide : styles.artworkCover}`}
            src={activeImage}
            alt={activeMedia?.alt ?? `Gambar utama ${title}`}
          />
        )}
        {videoError && (
          <span className={styles.mediaNotice} role="status">Video tidak dapat diputar.</span>
        )}
        {missingVideo && (
          <span className={styles.mediaNotice}>Video belum tersedia.</span>
        )}
      </div>

      {gallery.length > 0 && (
        <div
          className={styles.gallery}
          role="group"
          aria-label={`Galeri media ${title}`}
          onMouseLeave={() => setHoveredId(null)}
        >
          {gallery.map((item) => (
            <button
              key={item.id}
              className={`${styles.thumbnail} ${selectedId === item.id ? styles.selected : ''}`}
              type="button"
              aria-label={item.kind === 'video'
                ? `${item.alt}. ${item.src ? 'Klik untuk memutar video' : 'Video belum tersedia'}`
                : `Tampilkan ${item.alt}`}
              aria-pressed={selectedId === item.id}
              onMouseEnter={() => previewMedia(item)}
              onFocus={() => previewMedia(item)}
              onBlur={() => setHoveredId(null)}
              onClick={() => chooseMedia(item)}
            >
              <img
                src={item.kind === 'image' ? item.src : item.poster}
                alt=""
                loading="lazy"
                decoding="async"
              />
              {item.kind === 'video' && !item.posterHasPlayIcon && (
                <span className={styles.playMark} aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="m9 5 11 7-11 7V5Z" />
                  </svg>
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default GameMediaGallery
