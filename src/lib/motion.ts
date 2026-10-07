import type { Transition } from 'motion/react'

/**
 * Hareket sistemi — tüm bileşenler bu değerleri paylaşır,
 * böylece site tek bir "fizik" ile hareket eder.
 */
export const ease = {
  out: [0.23, 1, 0.32, 1] as const,
  inOut: [0.77, 0, 0.175, 1] as const,
  drawer: [0.32, 0.72, 0, 1] as const,
}

export const spring = {
  /** Arayüz öğeleri: hızlı, sekmeyen */
  snappy: { type: 'spring', stiffness: 520, damping: 40, mass: 0.8 } satisfies Transition,
  /** Modal / panel: hafif, doğal bir oturma */
  soft: { type: 'spring', duration: 0.5, bounce: 0.12 } satisfies Transition,
  /** İmleci takip eden 3B nesneler: ağır, tembel */
  heavy: { type: 'spring', stiffness: 60, damping: 18, mass: 1.2 } satisfies Transition,
}

/**
 * Kaydırmayla görünen öğeler için ortak giriş.
 * Performans: `filter: blur()` animasyonu her karede yeniden rasterleşir; yalnızca
 * opacity + transform kullanılır — ikisi de GPU'da kompozit edilir.
 */
export const reveal = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
}
