import styles from './Hero.module.css'
import { useNavigate } from 'react-router'

type HeroProps = {
  onExploreGames?: () => void
  onViewPromos?: () => void
}

function Hero({
  onExploreGames,
  onViewPromos,
}: HeroProps) {
  const navigate = useNavigate()
  return (
    <section
      className={styles.hero}
      aria-labelledby="hero-title"
    >
      <div className={styles.content}>
        <h1 id="hero-title" className={styles.title}>
          <span className={styles.line}>
            Cari{' '}
            <span className={styles.blueText}>Game</span>
            {' '}yang Kamu Mau.
          </span>

          <span className={styles.line}>
            Cek Harganya.
          </span>

          <span className={styles.line}>
            Temukan{' '}
            <span className={styles.greenText}>
              Deal Terbaik.
            </span>
          </span>
        </h1>

        <p className={styles.description}>
          Lagi cari game? Cek harga dan diskonnya dari
          berbagai platform di sini.
        </p>

        <div className={styles.actions}>
          <button
            type="button"
            className={`${styles.button} ${styles.primaryButton}`}
            onClick={() => {
              if (onExploreGames) {
                onExploreGames()
              } else {
                navigate('/catalog')
              }
            }}
          >
            Jelajahi Game
            <span aria-hidden="true">→</span>
          </button>

          <button
            type="button"
            className={`${styles.button} ${styles.secondaryButton}`}
            onClick={onViewPromos}
            disabled={!onViewPromos}
          >
            Lihat Promo
          </button>
        </div>
      </div>
    </section>
  )
}

export default Hero