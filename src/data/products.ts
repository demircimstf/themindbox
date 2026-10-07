/**
 * Koleksiyon — IQ Puzzle "Brain Fitness" setleri.
 * Ürün adları ve konsept markadan; parça sayıları illüstrasyonlarla birebir.
 * Ölçü/renk/zorluk değerleri ÖRNEKTİR — kesin değerler geldiğinde yalnızca bu dosya güncellenir.
 */
export type ProductArt = 'cross' | 'pyramids' | 'star' | 'litera'

export interface Product {
  id: string
  index: string
  series: string
  name: string
  kicker: string
  tagline: string
  description: string
  art: ProductArt
  difficulty: 1 | 2 | 3 | 4 | 5
  specs: { label: string; value: string }[]
}

export const products: Product[] = [
  {
    id: 'dort-yon',
    index: '01',
    series: 'IQ Puzzle',
    name: 'Dört Yön',
    kicker: 'Eşit kollu artı',
    tagline: 'Sekiz parça, dört eşit kol.',
    description:
      'Kutudan çıkan 8 adet özel kesim akrilik geometrik parçayı kusursuz bir şekilde birleştirerek dört kolu birbirine eşit artı formunu elde edin. Simetrik görünür — ama hiçbir parça göründüğü yere ait değildir.',
    art: 'cross',
    difficulty: 3,
    specs: [
      { label: 'Malzeme', value: 'Lazer kesim akrilik' },
      { label: 'Parça', value: '8' },
      { label: 'Renk', value: 'Turuncu' },
    ],
  },
  {
    id: 'misir-piramitleri',
    index: '02',
    series: 'IQ Puzzle',
    name: 'Mısır Piramitleri',
    kicker: 'Piramit formu',
    tagline: 'Yedi parça, iki piramit.',
    description:
      'Kutudan çıkan 7 adet özel kesim akrilik geometrik parçayı kusursuz bir şekilde birleştirerek Mısır piramitlerinin silüetini elde edin. Eğimler aynı, açılar yanıltıcı.',
    art: 'pyramids',
    difficulty: 4,
    specs: [
      { label: 'Malzeme', value: 'Lazer kesim akrilik' },
      { label: 'Parça', value: '7' },
      { label: 'Renk', value: 'Kehribar' },
    ],
  },
  {
    id: 'yildiz',
    index: '03',
    series: 'IQ Puzzle',
    name: 'Yıldız',
    kicker: 'Altı köşeli yıldız',
    tagline: 'Sekiz parça, altı köşe.',
    description:
      'Kutudan çıkan 8 adet özel kesim akrilik geometrik parçayı kusursuz bir şekilde birleştirerek altı köşeli yıldızı elde edin. Şeffaf akrilik, her denemede ışıkla oynar.',
    art: 'star',
    difficulty: 4,
    specs: [
      { label: 'Malzeme', value: 'Lazer kesim akrilik' },
      { label: 'Parça', value: '8' },
      { label: 'Renk', value: 'Şeffaf' },
    ],
  },
  {
    id: 'harf-a',
    index: '04',
    series: 'IQ Puzzle',
    name: 'Harf A',
    kicker: 'Harf & sembol serisi',
    tagline: 'Yedi parça, bir harf: A.',
    description:
      'Kutudan çıkan 7 adet özel kesim akrilik geometrik parçayı kusursuz bir şekilde birleştirerek "A" harfini elde edin. Ortadaki üçgen boşluk, çözümün en zor ipucudur.',
    art: 'litera',
    difficulty: 5,
    specs: [
      { label: 'Malzeme', value: 'Lazer kesim akrilik' },
      { label: 'Parça', value: '7' },
      { label: 'Renk', value: 'Kızıl turuncu' },
    ],
  },
]
