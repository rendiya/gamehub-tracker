import saleTagIcon from '../../assets/sale-tag-02.svg'
import SaleCarousel from './SaleCarousel'
import styles from './SaleEvents.module.css'

function SaleEvents() {
  return (
    <section
      className={styles.section}
      aria-labelledby="sale-events-title"
    >
      <div className={styles.heading}>
        <h2
          id="sale-events-title"
          className={styles.title}
        >
          Sale Events
        </h2>

        <img
          className={styles.saleTag}
          src={saleTagIcon}
          alt=""
          width={102}
          height={102}
          aria-hidden="true"
        />
      </div>

      <div
        className={styles.divider}
        aria-hidden="true"
      />

      <div className={styles.bannerWrapper}>
        <SaleCarousel />
      </div>
    </section>
  )
}

export default SaleEvents