import styles from './Pagination.module.css'

type PaginationProps = {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
}

function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null

  const visible = new Set([1, totalPages, page - 1, page, page + 1])
  const pages = Array.from(visible)
    .filter((p) => p >= 1 && p <= totalPages)
    .sort((a, b) => a - b)

  return (
    <nav aria-label="Halaman katalog" className={styles.pagination}>
      <button
        type="button"
        className={styles.arrow}
        aria-label="Halaman sebelumnya"
        disabled={page === 1}
        onClick={() => onPageChange(page - 1)}
      >‹</button>
      {pages.map((current, index) => (
        <span className={styles.item} key={current}>
          {index > 0 && current - pages[index - 1] > 1 && (
            <span className={styles.ellipsis} aria-hidden="true">…</span>
          )}
          <button
            type="button"
            className={current === page ? styles.active : styles.number}
            aria-label={`Halaman ${current}`}
            aria-current={current === page ? 'page' : undefined}
            onClick={() => onPageChange(current)}
          >{current}</button>
        </span>
      ))}
      <button
        type="button"
        className={styles.arrow}
        aria-label="Halaman berikutnya"
        disabled={page === totalPages}
        onClick={() => onPageChange(page + 1)}
      >›</button>
    </nav>
  )
}

export default Pagination
