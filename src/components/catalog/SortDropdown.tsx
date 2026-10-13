import { useEffect, useRef } from 'react'
import styles from './SortDropdown.module.css'

export type CatalogSort = 'latest' | 'bestseller' | 'discount' | 'lowest'

const SORT_OPTIONS: readonly { value: CatalogSort; label: string; available: boolean }[] = [
  { value: 'latest', label: 'Terbaru', available: true },
  { value: 'bestseller', label: 'Terlaris', available: false },
  { value: 'discount', label: 'Diskon Tertinggi', available: true },
  { value: 'lowest', label: 'Harga Terendah', available: true },
]

type SortDropdownProps = {
  value: CatalogSort
  onChange: (next: CatalogSort) => void
}

function SortDropdown({ value, onChange }: SortDropdownProps) {
  const detailsRef = useRef<HTMLDetailsElement>(null)

  useEffect(() => {
    const closeOnOutsideClick = (event: PointerEvent) => {
      if (!detailsRef.current?.contains(event.target as Node)) {
        detailsRef.current?.removeAttribute('open')
      }
    }
    document.addEventListener('pointerdown', closeOnOutsideClick)
    return () => document.removeEventListener('pointerdown', closeOnOutsideClick)
  }, [])

  const currentLabel = SORT_OPTIONS.find((option) => option.value === value)?.label ?? 'Terbaru'

  return (
    <details
      className={styles.dropdown}
      ref={detailsRef}
      onKeyDown={(event) => {
        if (event.key === 'Escape') {
          detailsRef.current?.removeAttribute('open')
          detailsRef.current?.querySelector('summary')?.focus()
        }
      }}
    >
      <summary className={styles.trigger} aria-label={`Urutkan: ${currentLabel}`}>
        <span>{currentLabel}</span>
        <span className={styles.arrow} aria-hidden="true" />
      </summary>
      <div className={styles.menu}>
        {SORT_OPTIONS.filter((option) => option.value !== value).map((option) => (
          <button
            className={styles.option}
            key={option.value}
            type="button"
            disabled={!option.available}
            title={option.available ? undefined : 'Memerlukan data penjualan dari backend'}
            onClick={() => {
              onChange(option.value)
              detailsRef.current?.removeAttribute('open')
            }}
          >
            {option.label}
          </button>
        ))}
      </div>
    </details>
  )
}

export default SortDropdown
