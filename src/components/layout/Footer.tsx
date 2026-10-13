import styles from './Footer.module.css'

function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.brand}>
          <a
            href="/"
            className={styles.logo}
            aria-label="GameHub, kembali ke beranda"
          >
            Game<span className={styles.logoAccent}>Hub</span>
          </a>

          <span
            className={styles.brandLine}
            aria-hidden="true"
          />
        </div>

        <span
          className={styles.separator}
          aria-hidden="true"
        />

        <div className={styles.description}>
          <p>
            Game Hub adalah direktori &amp; tracker diskon game
            non-komersial. Kami bukan reseller dan tidak menjual
            game, kami hanya menampilkan informasi harga
            referensi dan mengarahkan pengguna ke platform
            resmi untuk pembelian.
          </p>

          <p>
            Game Hub tidak berafiliasi dengan Steam/Valve,
            Epic Games, GOG, atau publisher terkait. Harga
            bersifat referensi; harga final &amp; proses
            pembayaran mengacu ke platform resmi saat checkout.
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
