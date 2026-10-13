import { useState } from 'react'
import { Link, useLocation, useParams } from 'react-router'

import epicLogo from '../assets/epic-games.svg'
import steamLogo from '../assets/steam-logo.svg'
import DiscountTracker from '../components/detail/DiscountTracker'
import GameMediaGallery from '../components/detail/GameMediaGallery'
import { catalogGames } from '../data/catalogGames'
import { getGameDetailContent, type SystemSpec,} from '../data/gameDetails'
import { buildDummyPriceHistory, type PriceHistoryStore } from '../data/priceHistory'
import { getStoreUrl } from '../data/storeLinks'
import styles from './GameDetailPage.module.css'

const historyStoreLabels: Record<PriceHistoryStore, string> = {
  steam: 'Steam',
  epic: 'Epic',
  gog: 'GOG',
}

const rupiah = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  maximumFractionDigits: 0,
})

function SpecificationList({ title, specs }: { title: string; specs: readonly SystemSpec[] }) {
  return (
    <div>
      <h3>{title}</h3>
      <ul>
        {specs.map(({ label, value }) => (
          <li key={label}>{label}: {value}</li>
        ))}
      </ul>
    </div>
  )
}

function GameDetailPage() {
  const { gameId } = useParams<'gameId'>()
  const location = useLocation()
  const [descriptionOpen, setDescriptionOpen] = useState(false)
  const [requirementsOpen, setRequirementsOpen] = useState(false)
  const [historyStore, setHistoryStore] = useState<PriceHistoryStore>('steam')

  // ID merepresentasikan GAME, bukan listing tokonya.
  const offers = catalogGames.filter((item) => item.id === gameId)
  const game = offers[0]

  if (!game) {
    return (
      <main className={styles.page}>
        <div className={styles.container}>
          <h1>Game tidak ditemukan</h1>
          <p>Game yang kamu cari belum tersedia dalam katalog.</p>
          <Link className={styles.backLink} to="/catalog">← Kembali ke Katalog</Link>
        </div>
      </main>
    )
  }

  const detail = getGameDetailContent(game.id, game.title)

  // Riwayat dummy: toko tanpa listing (mis. GOG) memakai harga normal dari listing pertama.
  const historyOffer = offers.find((offer) => offer.store === historyStore)
  const historyPoints = buildDummyPriceHistory({
    gameId: game.id,
    store: historyStore,
    originalPrice: (historyOffer ?? game).originalPrice,
    currentPrice: historyOffer?.currentPrice,
  })
  const description = detail?.description ?? []
  const state: unknown = location.state
  let backTo = '/catalog'
  if (state && typeof state === 'object' && 'from' in state) {
    const from = (state as { from: unknown }).from
    if (typeof from === 'string' && from.startsWith('/') && !from.startsWith('//') && !from.includes('\\')) {
      backTo = from
    }
  }

  const orderedOffers = [...offers].sort((a, b) => (
    a.store === 'steam' ? -1 : b.store === 'steam' ? 1 : 0
  ))

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <Link className={styles.backLink} to={backTo}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
            <path d="m12 4-8 8 8 8M4 12h17" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Kembali
        </Link>

        <h1 className={styles.gameTitle}>{game.title}</h1>

        <div className={styles.overview}>
          <div className={styles.mediaColumn}>
            <GameMediaGallery
              key={game.id}
              title={game.title}
              heroSrc={detail?.hero ?? game.coverSrc}
              hasWideHero={Boolean(detail)}
              gallery={detail?.gallery ?? []}
            />
          </div>

          <aside className={styles.offers} aria-label="Perbandingan harga toko">
            {orderedOffers.map((offer, index) => {
              const discount = offer.originalPrice > 0
                ? Math.max(0, Math.round((1 - offer.currentPrice / offer.originalPrice) * 100))
                : 0
              return (
                <div key={`${offer.store}:${offer.id}`}>
                  {index > 0 && <div className={styles.offerDivider} aria-hidden="true" />}
                  <div className={styles.offerCard}>
                    <div className={styles.offerBrand}>
                      <img src={offer.store === 'steam' ? steamLogo : epicLogo} alt="" />
                      <strong>{offer.store === 'steam' ? 'Steam' : 'Epic'}</strong>
                    </div>
                    <div className={styles.offerPrices}>
                      {offer.originalPrice > offer.currentPrice && (
                        <del>{rupiah.format(offer.originalPrice)}</del>
                      )}
                      <strong>{rupiah.format(offer.currentPrice)}</strong>
                    </div>
                    {discount > 0 && <span className={styles.discount}>{discount}%</span>}
                  </div>
                  <a
                    className={styles.storeLink}
                    href={getStoreUrl(offer.store, game.id, game.title)}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Lihat di {offer.store === 'steam' ? 'Steam' : 'Epic Games Store'}
                    <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </a>
                </div>
              )
            })}
            <p className={styles.demoNote}>Harga contoh dari data frontend; belum terhubung ke harga toko secara langsung.</p>
          </aside>
        </div>

        <section className={styles.about} aria-labelledby="about-title">
          <h2 id="about-title">Tentang Game ini</h2>
          {description.length ? (
            <>
              <div id="game-description" className={styles.description}>
                {descriptionOpen ? (
                  description.map((paragraph) => <p key={paragraph}>{paragraph}</p>)
                ) : (
                  <p className={styles.clampedDescription}>{description[0]}</p>
                )}
              </div>
              <button
                className={styles.readMore}
                type="button"
                aria-expanded={descriptionOpen}
                aria-controls="game-description"
                onClick={() => setDescriptionOpen((open) => !open)}
              >
                {descriptionOpen ? 'Tampilkan lebih sedikit' : 'Baca selengkapnya'}
                <svg className={descriptionOpen ? styles.upChevron : undefined} viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="m5 9 7 7 7-7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </>
          ) : (
            <p className={styles.unavailable}>Deskripsi lengkap untuk game ini belum tersedia.</p>
          )}
        </section>

        <section className={styles.requirements} aria-labelledby="requirements-title">
          <h2 id="requirements-title">
            <button
              className={styles.requirementsToggle}
              type="button"
              aria-expanded={requirementsOpen}
              aria-controls="game-requirements"
              onClick={() => setRequirementsOpen((open) => !open)}
            >
              Persyaratan Sistem
              <svg className={requirementsOpen ? styles.upChevron : undefined} viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="m5 9 7 7 7-7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </h2>
          <div id="game-requirements" className={styles.requirementsContent} hidden={!requirementsOpen}>
            {detail ? (
              <div className={styles.specGrid}>
                {detail.minimum.length > 0 && <SpecificationList title="Minimum:" specs={detail.minimum} />}
                {detail.recommended.length > 0 && <SpecificationList title="Direkomendasikan:" specs={detail.recommended} />}
              </div>
            ) : (
              <p className={styles.unavailable}>Persyaratan sistem game ini belum tersedia.</p>
            )}
          </div>
        </section>

        <section className={styles.history} aria-labelledby="history-title">
          <div className={styles.historyHeading}>
            <div>
              <h2 id="history-title">Riwayat harga &amp; diskon</h2>
              <p className={styles.historyNote}>Data dummy 30 hari terakhir. Diperbarui otomatis setiap hari.</p>
            </div>
            <label className={styles.historySelector}>
              <span className={styles.visuallyHidden}>Pilih platform riwayat harga</span>
              <select value={historyStore} onChange={(event) => setHistoryStore(event.target.value as PriceHistoryStore)}>
                <option value="steam">Steam</option>
                <option value="epic">Epic</option>
                <option value="gog">GOG</option>
              </select>
            </label>
          </div>
          <DiscountTracker points={historyPoints} storeLabel={historyStoreLabels[historyStore]} />
        </section>
      </div>
    </main>
  )
}

export default GameDetailPage