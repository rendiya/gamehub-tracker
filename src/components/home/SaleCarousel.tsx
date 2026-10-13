import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router'

import autumnSale from '../../assets/steam-autumn-sale.webp'
import comparePrices from '../../assets/banners/promo-bandingkan-harga.webp'
import favoriteDeals from '../../assets/banners/promo-game-favorit.webp'
import allPromos from '../../assets/banners/promo-satu-tempat.webp'
import styles from './SaleCarousel.module.css'

const SLIDES = [
  {
    id: 'autumn',
    image: autumnSale,
    description: 'Steam Autumn Sale — menuju bagian Steam di beranda',
    href: '#steam',
  },
  {
    id: 'compare',
    image: comparePrices,
    description: 'Bandingkan harga, cari promo, main lebih banyak — buka katalog',
    href: '/catalog',
  },
  {
    id: 'favorites',
    image: favoriteDeals,
    description: 'Game favoritmu dengan harga terbaik — buka katalog',
    href: '/catalog',
  },
  {
    id: 'all',
    image: allPromos,
    description: 'Satu tempat untuk semua promo game — buka katalog',
    href: '/catalog',
  },
] as const

const AUTOPLAY_DELAY_MS = 5500
const MIN_SWIPE_DISTANCE_PX = 45

function SaleCarousel() {
  const [activeIndex, setActiveIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const [pageVisible, setPageVisible] = useState(() =>
    typeof document === 'undefined' ? true : !document.hidden,
  )
  const [reducedMotion, setReducedMotion] = useState(() =>
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )
  const touchStartX = useRef<number | null>(null)
  const suppressClickAfterSwipe = useRef(false)

  useEffect(() => {
    const handleVisibility = () => setPageVisible(!document.hidden)
    document.addEventListener('visibilitychange', handleVisibility)
    return () => document.removeEventListener('visibilitychange', handleVisibility)
  }, [])

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    const handleChange = (event: MediaQueryListEvent) =>
      setReducedMotion(event.matches)
    query.addEventListener('change', handleChange)
    return () => query.removeEventListener('change', handleChange)
  }, [])

  // Timer dimulai ulang saat pengguna memilih slide secara manual.
  useEffect(() => {
    if (paused || !pageVisible || reducedMotion) return

    const timeoutId = window.setTimeout(() => {
      setActiveIndex((current) => (current + 1) % SLIDES.length)
    }, AUTOPLAY_DELAY_MS)

    return () => window.clearTimeout(timeoutId)
  }, [activeIndex, paused, pageVisible, reducedMotion])

  const showPrevious = () => {
    setActiveIndex((current) => (current - 1 + SLIDES.length) % SLIDES.length)
  }

  const showNext = () => {
    setActiveIndex((current) => (current + 1) % SLIDES.length)
  }

  return (
    <section
      className={styles.carousel}
      aria-label="Banner promo GameHub"
      aria-roledescription="carousel"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setPaused(false)
        }
      }}
      onTouchStart={(event) => {
        suppressClickAfterSwipe.current = false
        touchStartX.current = event.touches[0]?.clientX ?? null
      }}
      onTouchEnd={(event) => {
        if (touchStartX.current === null) return
        const endX = event.changedTouches[0]?.clientX
        const delta = endX === undefined ? 0 : endX - touchStartX.current
        touchStartX.current = null
        if (Math.abs(delta) < MIN_SWIPE_DISTANCE_PX) return
        suppressClickAfterSwipe.current = true
        if (delta > 0) showPrevious()
        else showNext()
      }}
      onTouchCancel={() => { touchStartX.current = null }}
      onClickCapture={(event) => {
        if (!suppressClickAfterSwipe.current) return
        event.preventDefault()
        suppressClickAfterSwipe.current = false
      }}
    >
      <div className={styles.viewport}>
        <div
          className={styles.track}
          style={{ transform: `translateX(-${activeIndex * 100}%)` }}
        >
          {SLIDES.map((slide, index) => {
            const isActive = index === activeIndex
            const contents = (
              <img
                className={`${styles.image} ${slide.id === 'autumn' ? styles.autumn : ''}`}
                src={slide.image}
                alt={slide.description}
                loading={index === 0 ? 'eager' : 'lazy'}
                draggable={false}
              />
            )

            return (
              <div
                className={styles.slide}
                key={slide.id}
                aria-hidden={!isActive}
                role="group"
                aria-roledescription="slide"
                aria-label={`${index + 1} dari ${SLIDES.length}`}
              >
                {slide.href.startsWith('#') ? (
                  <a
                    className={styles.slideLink}
                    href={slide.href}
                    tabIndex={isActive ? 0 : -1}
                    aria-label={slide.description}
                  >
                    {contents}
                  </a>
                ) : (
                  <Link
                    className={styles.slideLink}
                    to={slide.href}
                    tabIndex={isActive ? 0 : -1}
                    aria-label={slide.description}
                  >
                    {contents}
                  </Link>
                )}
              </div>
            )
          })}
        </div>
      </div>

      <button
        className={`${styles.arrow} ${styles.previous}`}
        type="button"
        aria-label="Banner sebelumnya"
        onClick={showPrevious}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="m15 18-6-6 6-6" />
        </svg>
      </button>

      <button
        className={`${styles.arrow} ${styles.next}`}
        type="button"
        aria-label="Banner berikutnya"
        onClick={showNext}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="m9 18 6-6-6-6" />
        </svg>
      </button>

      <div className={styles.indicators} aria-label="Pilih banner">
        {SLIDES.map((slide, index) => (
          <button
            key={slide.id}
            className={`${styles.indicator} ${index === activeIndex ? styles.indicatorActive : ''}`}
            type="button"
            aria-label={`Tampilkan banner ${index + 1}: ${slide.description}`}
            aria-current={index === activeIndex ? 'true' : undefined}
            onClick={() => setActiveIndex(index)}
          />
        ))}
      </div>
    </section>
  )
}

export default SaleCarousel
