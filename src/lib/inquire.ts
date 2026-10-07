/** Ürün detayından iletişim formuna konu taşımak için hafif bir olay köprüsü */
export const INQUIRE_EVENT = 'mindbox:inquire'

export const inquire = (product: string) => {
  window.dispatchEvent(new CustomEvent(INQUIRE_EVENT, { detail: product }))
  document.getElementById('iletisim')?.scrollIntoView({ behavior: 'smooth' })
}
