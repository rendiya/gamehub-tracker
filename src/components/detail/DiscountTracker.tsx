import type { PricePoint } from '../../data/priceHistory'
import styles from './DiscountTracker.module.css'

type DiscountTrackerProps = {
  points: readonly PricePoint[]
  storeLabel: string
}

const rupiah = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  maximumFractionDigits: 0,
})

const shortDate = new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short' })
const longDate = new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })

function parseDate(value: string): Date {
  const [year, month, day] = value.split('-').map(Number)
  return new Date(year, month - 1, day)
}

function compactRupiah(value: number): string {
  if (value >= 1_000_000) {
    return `Rp ${(value / 1_000_000).toLocaleString('id-ID', { maximumFractionDigits: 1 })} jt`
  }
  return `Rp ${Math.round(value / 1000).toLocaleString('id-ID')} rb`
}

const CHART_WIDTH = 800
const CHART_HEIGHT = 260
const PAD = { top: 20, right: 20, bottom: 36, left: 84 }

function PriceChart({ points }: { points: readonly PricePoint[] }) {
  const originalPrice = points[0]?.originalPrice ?? 0
  const prices = points.map((point) => point.price)
  const low = Math.min(...prices)
  const high = Math.max(originalPrice, ...prices)
  const margin = (high - low) * 0.1 || high * 0.1 || 1
  const min = Math.max(0, low - margin)
  const max = high + margin

  const plotWidth = CHART_WIDTH - PAD.left - PAD.right
  const plotHeight = CHART_HEIGHT - PAD.top - PAD.bottom
  const x = (index: number) => PAD.left + (points.length > 1 ? index / (points.length - 1) : 0) * plotWidth
  const y = (value: number) => PAD.top + (1 - (value - min) / (max - min || 1)) * plotHeight

  const linePath = points
    .map((point, index) => `${index === 0 ? 'M' : 'L'}${x(index).toFixed(1)},${y(point.price).toFixed(1)}`)
    .join(' ')

  const ticks = [max, (max + min) / 2, min]
  const labelIndexes = points.map((_, index) => index).filter((index) => index % 7 === 0 || index === points.length - 1)

  return (
    <svg
      className={styles.chart}
      viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
      role="img"
      aria-label={`Grafik harga ${points.length} hari terakhir`}
    >
      {ticks.map((tick) => (
        <g key={tick}>
          <line className={styles.grid} x1={PAD.left} x2={CHART_WIDTH - PAD.right} y1={y(tick)} y2={y(tick)} />
          <text className={styles.axis} x={PAD.left - 10} y={y(tick)} textAnchor="end" dominantBaseline="middle">
            {compactRupiah(tick)}
          </text>
        </g>
      ))}

      <line
        className={styles.originalLine}
        x1={PAD.left}
        x2={CHART_WIDTH - PAD.right}
        y1={y(originalPrice)}
        y2={y(originalPrice)}
      />

      {labelIndexes.map((index) => (
        <text key={index} className={styles.axis} x={x(index)} y={CHART_HEIGHT - 10} textAnchor="middle">
          {shortDate.format(parseDate(points[index].date))}
        </text>
      ))}

      <path className={styles.line} d={linePath} fill="none" />

      {points.map((point, index) => (
        <circle
          key={point.date}
          className={point.discount > 0 ? styles.dotSale : styles.dot}
          cx={x(index)}
          cy={y(point.price)}
          r={point.discount > 0 ? 5 : 3}
        >
          <title>{`${longDate.format(parseDate(point.date))}: ${rupiah.format(point.price)}${point.discount > 0 ? ` (-${point.discount}%)` : ''}`}</title>
        </circle>
      ))}
    </svg>
  )
}

function DiscountTracker({ points, storeLabel }: DiscountTrackerProps) {
  if (points.length === 0) {
    return <p className={styles.empty}>Belum ada data harga untuk {storeLabel}.</p>
  }

  const today = points[points.length - 1]
  const lowest = points.reduce((best, point) => (point.price < best.price ? point : best), points[0])
  const biggest = points.reduce((best, point) => (point.discount > best.discount ? point : best), points[0])
  const saleDays = points.filter((point) => point.discount > 0).length
  const averageDiscount = Math.round(points.reduce((sum, point) => sum + point.discount, 0) / points.length)

  const dailyRows = points
    .map((point, index) => ({ point, previous: points[index - 1] }))
    .reverse()

  return (
    <div className={styles.tracker}>
      <dl className={styles.stats}>
        <div>
          <dt>Harga hari ini</dt>
          <dd>{rupiah.format(today.price)}</dd>
          <span>Diskon {today.discount}%</span>
        </div>
        <div>
          <dt>Terendah ({points.length} hari)</dt>
          <dd>{rupiah.format(lowest.price)}</dd>
          <span>{longDate.format(parseDate(lowest.date))}</span>
        </div>
        <div>
          <dt>Diskon terbesar</dt>
          <dd>{biggest.discount}%</dd>
          <span>{longDate.format(parseDate(biggest.date))}</span>
        </div>
        <div>
          <dt>Hari diskon</dt>
          <dd>{saleDays} / {points.length}</dd>
          <span>Rata-rata diskon {averageDiscount}%</span>
        </div>
      </dl>

      <div className={styles.chartWrap}>
        <PriceChart points={points} />
        <div className={styles.legend} aria-hidden="true">
          <span><i className={styles.legendLine} /> Harga</span>
          <span><i className={styles.legendDashed} /> Harga normal</span>
          <span><i className={styles.legendSale} /> Hari diskon</span>
        </div>
      </div>

      <h3 className={styles.listTitle}>Diskon hari ke hari</h3>
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th scope="col">Tanggal</th>
              <th scope="col">Harga</th>
              <th scope="col">Diskon</th>
              <th scope="col">Perubahan</th>
            </tr>
          </thead>
          <tbody>
            {dailyRows.map(({ point, previous }) => {
              const delta = previous ? point.price - previous.price : 0
              return (
                <tr key={point.date}>
                  <td>{longDate.format(parseDate(point.date))}</td>
                  <td>{rupiah.format(point.price)}</td>
                  <td>
                    {point.discount > 0
                      ? <span className={styles.badge}>-{point.discount}%</span>
                      : <span className={styles.muted}>—</span>}
                  </td>
                  <td>
                    {!previous || delta === 0 ? (
                      <span className={styles.muted}>Tetap</span>
                    ) : delta < 0 ? (
                      <span className={styles.down}>▼ {rupiah.format(Math.abs(delta))}</span>
                    ) : (
                      <span className={styles.up}>▲ {rupiah.format(delta)}</span>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default DiscountTracker
