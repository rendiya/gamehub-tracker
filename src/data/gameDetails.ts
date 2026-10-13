import rdr2Hero from '../assets/detail/rdr2-hero.webp'
import rdr2Preview1 from '../assets/detail/rdr2-preview-1.webp'
import rdr2Preview2 from '../assets/detail/rdr2-preview-2.webp'
import rdr2Preview3 from '../assets/detail/rdr2-preview-3.webp'

export type SystemSpec = { label: string; value: string }
export type GameMedia =
  | { id: string; kind: 'image'; src: string; alt: string }
  | { id: string; kind: 'video'; poster: string; src?: string; alt: string; posterHasPlayIcon?: boolean }

export type DetailContent = {
  hero: string
  gallery: readonly GameMedia[]
  description: readonly string[]
  minimum: readonly SystemSpec[]
  recommended: readonly SystemSpec[]
}

const rdr2: DetailContent = {
  hero: rdr2Hero,
  gallery: [
    {
      id: 'rdr2-video',
      kind: 'video',
      poster: rdr2Preview1,
      posterHasPlayIcon: true, // Ikon play sudah ada di gambar poster dari Figma.
      alt: 'Pratinjau video Red Dead Redemption 2',
    },
    { id: 'rdr2-image-1', kind: 'image', src: rdr2Preview2, alt: 'Arthur Morgan saat beraksi' },
    { id: 'rdr2-image-2', kind: 'image', src: rdr2Preview3, alt: 'Arthur Morgan menunggang kuda di sebuah permukiman' },
  ],
  description: [
    'Amerika, tahun 1899. Arthur Morgan dan Van der Linde Gang adalah pelanggar hukum yang kabur. Diikuti agen federal dan pemburu hadiah terbaik di negaranya, mereka harus merampok, mencuri, dan bertarung di sepanjang jalan daratan liar Amerika guna bertahan hidup. Seiring perpecahan internal makin mengancam kelangsungan geng, Arthur harus memilih antara idealismenya dengan kesetiaannya terhadap geng yang membesarkannya.',
    'Pemenang lebih dari 175 Game of the Year Award dan penerima lebih dari 250 skor sempurna, Red Dead Redemption 2 adalah kisah epik tentang kehormatan dan kesetiaan di awal masa modern.',
    'Red Dead Redemption 2 juga mencakup Red Dead Online — pengalaman multiplayer yang mengambil tempat di semesta Red Dead Redemption 2 — bermain sendiri atau bentuk kelompok; jalankan bar; kalahkan penegak hukum, geng pelanggar hukum, hewan liar yang buas, dan masih banyak lagi seiring menempuh jalan pribadi di perbatasan Amerika.',
  ],
  minimum: [
    { label: 'Arsitektur', value: 'Prosesor 64-bit dan OS diperlukan' },
    { label: 'OS', value: 'Windows 10 - 64-bit' },
    { label: 'Prosesor', value: 'Intel® Core™ i5-2500K / AMD FX-6300' },
    { label: 'Memori', value: '8 GB RAM' },
    { label: 'Grafis', value: 'Nvidia GeForce GTX 770 2GB / AMD Radeon R9 280 3GB' },
    { label: 'Jaringan', value: 'Koneksi Internet Broadband' },
    { label: 'Penyimpanan', value: '150 GB ruang tersedia' },
    { label: 'Kartu suara', value: 'Direct X Compatible' },
  ],
  recommended: [
    { label: 'Arsitektur', value: 'Prosesor 64-bit dan OS diperlukan' },
    { label: 'OS', value: 'Windows 10 - 64-bit' },
    { label: 'Prosesor', value: 'Intel® Core™ i7-4770K / AMD Ryzen 5 1500X' },
    { label: 'Memori', value: '12 GB RAM' },
    { label: 'Grafis', value: 'Nvidia GeForce GTX 1060 6GB / AMD Radeon RX 480 4GB' },
    { label: 'Jaringan', value: 'Koneksi Internet Broadband' },
    { label: 'Penyimpanan', value: '150 GB ruang tersedia' },
    { label: 'Kartu suara', value: 'Direct X Compatible' },
  ],
}

export function getGameDetailContent(gameId: string, title: string): DetailContent | null {
  // Data demo punya ID game bersama lintas toko; jaga ID itu saat integrasi API.
  if (gameId === 'red-dead-redemption-2' || title.toLowerCase().includes('red dead redemption 2')) {
    return rdr2
  }
  return null
}
