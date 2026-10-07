import type { ProductArt } from './products'

/**
 * Deneyim galerisi. Gerçek fotoğraflar `public/gallery/` altına konup
 * `image` alanı doldurulduğunda, yer tutucu kompozisyonun yerini alır.
 */
export interface GalleryItem {
  id: string
  caption: string
  meta: string
  art: ProductArt
  /** Yer tutucu zemin tonu */
  tone: 'oak' | 'linen' | 'stone' | 'walnut'
  image?: string
}

export const gallery: GalleryItem[] = [
  { id: 'g1', caption: 'Pazar sabahı, son parça.', meta: 'Dört Yön', art: 'cross', tone: 'linen' },
  { id: 'g2', caption: 'Eğimler aynı, açılar değil.', meta: 'Mısır Piramitleri', art: 'pyramids', tone: 'oak' },
  { id: 'g3', caption: 'Işığı kıran sekiz parça.', meta: 'Yıldız', art: 'star', tone: 'stone' },
  { id: 'g4', caption: 'Ortadaki boşluk, en zor ipucu.', meta: 'Harf A', art: 'litera', tone: 'walnut' },
  { id: 'g5', caption: 'Kahve molasında dört yön.', meta: 'Dört Yön', art: 'cross', tone: 'oak' },
]
