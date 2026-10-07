/* ─────────────────────────────────────────────────────────────
   2B bulmaca motoru — düz, özel kesim akrilik parçalar
   Her model; hedef silüet (outline + varsa iç boşluk) ve onu birebir
   döşeyen 7–8 parçadan oluşur. Parçalar örtüşmez ve hedefi boşluksuz
   doldurur (alan ve örtüşme hesabıyla doğrulandı).
   ───────────────────────────────────────────────────────────── */
import type { ProductArt as ArtKind } from '@/data/products'

export type Pt = [number, number]

export interface Tint {
  fill: string
  stroke: string
  /** Kutu üzerindeki sembol ve vurgu rengi */
  ink: string
}

export interface ShapeDef {
  id: ArtKind
  name: string
  outline: Pt[]
  hole?: Pt[]
  pieces: Pt[][]
  tint: Tint
  /** Basık şekiller (ör. piramit) diğerleriyle aynı görsel ağırlıkta dursun diye ek ölçek */
  boost?: number
}

const ORANGE: Tint = { fill: 'rgba(240,104,30,0.86)', stroke: '#b8450f', ink: '#e8601c' }
const AMBER: Tint = { fill: 'rgba(247,150,34,0.86)', stroke: '#b4630d', ink: '#e88a12' }
// Şeffaf akrilik: fildişi zeminde kaybolmasın diye hafif soğuk, camsı bir ton
const CLEAR: Tint = { fill: 'rgba(208,224,230,0.62)', stroke: 'rgba(62,92,104,0.55)', ink: '#5b7d8a' }
const EMBER: Tint = { fill: 'rgba(226,76,28,0.86)', stroke: '#9e310c', ink: '#d44a1a' }

const R3 = Math.sqrt(3)
const polar = (deg: number, r: number): Pt => [Math.cos((deg * Math.PI) / 180) * r, Math.sin((deg * Math.PI) / 180) * r]

/** Altı köşeli yıldız: 6 uç + iç altıgen, 8 parçaya bölünmüş */
const STAR: ShapeDef = (() => {
  const P = Array.from({ length: 6 }, (_, k) => polar(270 + 60 * k, 1))
  const I = Array.from({ length: 6 }, (_, k) => polar(300 + 60 * k, 1 / R3))
  const O: Pt = [0, 0]
  return {
    id: 'star',
    name: 'Yıldız',
    outline: P.flatMap((p, k) => [p, I[k]]),
    pieces: [
      [P[0], I[0], O, I[5]],
      [I[0], P[1], I[1]],
      [O, I[0], I[1], I[2]],
      [I[1], P[2], I[2]],
      [I[2], P[3], I[3], O],
      [I[3], P[4], I[4]],
      [O, I[3], I[4], I[5]],
      [I[4], P[5], I[5]],
    ],
    tint: CLEAR,
  }
})()

export const SHAPES: Record<ArtKind, ShapeDef> = {
  cross: {
    id: 'cross',
    name: 'Dört Yön',
    outline: [[2, 0], [4, 0], [4, 2], [6, 2], [6, 4], [4, 4], [4, 6], [2, 6], [2, 4], [0, 4], [0, 2], [2, 2]],
    pieces: [
      [[3, 3], [2, 2], [2, 0], [3, 0]],
      [[3, 3], [3, 0], [4, 0], [4, 2]],
      [[4, 2], [6, 2], [6, 4]],
      [[3, 3], [4, 2], [6, 4], [4, 4]],
      [[4, 4], [4, 6], [2, 6]],
      [[3, 3], [4, 4], [2, 6], [2, 4]],
      [[3, 3], [2, 4], [0, 4], [0, 3]],
      [[3, 3], [0, 3], [0, 2], [2, 2]],
    ],
    tint: ORANGE,
  },
  pyramids: {
    id: 'pyramids',
    name: 'Mısır Piramitleri',
    outline: [[0, 6], [4, 2], [7, 5], [8, 4], [10, 6]],
    pieces: [
      [[2, 4], [4, 2], [4, 4]],
      [[0, 6], [2, 4], [2, 6]],
      [[2, 4], [4, 4], [4, 6], [2, 6]],
      [[4, 2], [6, 4], [4, 4]],
      [[4, 4], [6, 4], [4, 6]],
      [[6, 4], [7, 5], [7, 6], [4, 6]],
      [[7, 5], [8, 4], [10, 6], [7, 6]],
    ],
    tint: AMBER,
    boost: 1.22,
  },
  star: STAR,
  litera: {
    id: 'litera',
    name: 'Harf A',
    outline: [[0, 8], [4, 0], [8, 8], [6, 8], [5, 6], [3, 6], [2, 8]],
    hole: [[4, 4], [4.5, 5], [3.5, 5]],
    pieces: [
      [[4, 0], [2, 4], [4, 4]],
      [[4, 0], [4, 4], [6, 4]],
      [[2, 4], [4, 4], [3.5, 5], [4, 5], [4, 6], [1, 6]],
      [[4, 4], [6, 4], [7, 6], [4, 6], [4, 5], [4.5, 5]],
      [[1, 6], [3, 6], [0, 8]],
      [[3, 6], [2, 8], [0, 8]],
      [[5, 6], [7, 6], [8, 8], [6, 8]],
    ],
    tint: EMBER,
  },
}

export const SHAPE_ORDER: ArtKind[] = ['cross', 'pyramids', 'star', 'litera']

/* ─────────────────────────────────────────────────────────────
   Yerleşim — "kaostan düzene"
   Parçalar masada YUVALARINA GİTMEZ. Merkezde üst üste binmiş, darmadağınık
   bir yığın olarak durur ve hafifçe çalkalanır; belirli bir anda yığın bütün
   olarak çözülür ve hedef form tek parça olarak "var olur". Hiçbir parça bir
   yerden bir yere yürümediği için hangi parçanın nereye gittiği okunamaz.
   ───────────────────────────────────────────────────────────── */
export interface PieceLayout {
  points: string
  /** Kurulu hâldeki ağırlık merkezi (dönme ekseni) */
  cx: number
  cy: number
  /** Yığındaki konum: kurulu konuma göre öteleme + dönüş */
  pile: { x: number; y: number; rotate: number }
}

export interface Layout {
  /** Hedef silüet (boşluk varsa evenodd) */
  outlinePath: string
  pieces: PieceLayout[]
  center: Pt
}

// Masaya gelişigüzel dökülmüş gibi: bazı parçalar ters, bazıları yamuk
const PILE_ROT = [38, -64, 122, -28, 86, -146, 18, 172]
const GOLDEN = Math.PI * (3 - Math.sqrt(5))

interface LayoutOptions {
  /** Kurulu şeklin en büyük boyutu (viewBox birimi) */
  fit?: number
  center?: Pt
  /** Yığının yarıçapı — küçük tutulur ki parçalar üst üste binsin */
  spread?: number
}

export function layoutShape(def: ShapeDef, opts: LayoutOptions = {}): Layout {
  const { fit = 112, center = [100, 100], spread = 30 } = opts
  const xs = def.outline.map((p) => p[0])
  const ys = def.outline.map((p) => p[1])
  const [minX, maxX, minY, maxY] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)]
  const s = (fit * (def.boost ?? 1)) / Math.max(maxX - minX, maxY - minY)
  const tx = center[0] - ((minX + maxX) / 2) * s
  const ty = center[1] - ((minY + maxY) / 2) * s
  const map = ([x, y]: Pt): Pt => [x * s + tx, y * s + ty]
  const fmt = (pts: Pt[]) => pts.map(([x, y]) => `${x.toFixed(2)},${y.toFixed(2)}`).join(' ')
  const ring2path = (pts: Pt[]) => 'M' + pts.map(map).map(([x, y]) => `${x.toFixed(2)} ${y.toFixed(2)}`).join('L') + 'Z'

  const n = def.pieces.length
  const pieces = def.pieces.map((pc, i) => {
    const pts = pc.map(map)
    const cx = pts.reduce((a, p) => a + p[0], 0) / pts.length
    const cy = pts.reduce((a, p) => a + p[1], 0) / pts.length
    // Yığın konumu, parçanın yuvasından BAĞIMSIZ: karıştırılmış sırayla altın açı sarmalı
    const k = (i * 3 + 1) % n
    const a = k * GOLDEN + 0.6
    const r = spread * Math.sqrt((k + 0.5) / n)
    const px = center[0] + Math.cos(a) * r
    const py = center[1] + Math.sin(a) * r * 0.85
    return { points: fmt(pts), cx, cy, pile: { x: px - cx, y: py - cy, rotate: PILE_ROT[i % PILE_ROT.length] } }
  })

  return { outlinePath: ring2path(def.outline) + (def.hole ? ring2path(def.hole) : ''), pieces, center }
}

/**
 * Yığın içindeki çalkalanma: küçük, parçaya özgü salınımlar ve yavaş bir yuvarlanma.
 * `t` saniye cinsinden; `amp` 0→1 arası çalkalanma şiddeti.
 */
export function chaosAt(p: PieceLayout, i: number, t: number, amp = 1) {
  const dir = i % 2 === 0 ? 1 : -1
  return {
    x: p.pile.x + amp * 6 * Math.sin(t * (0.9 + i * 0.13) + i * 1.7),
    y: p.pile.y + amp * 5 * Math.cos(t * (0.75 + i * 0.11) + i * 2.3),
    rotate: p.pile.rotate + amp * dir * (14 * Math.sin(t * 0.6 + i) + 22 * t),
  }
}

export const chaosTransform = (p: PieceLayout, i: number, t: number, amp = 1, scale = 1) => {
  const { x, y, rotate } = chaosAt(p, i, t, amp)
  const base = `translate(${x.toFixed(2)} ${y.toFixed(2)}) rotate(${rotate.toFixed(2)} ${p.cx.toFixed(2)} ${p.cy.toFixed(2)})`
  return scale === 1
    ? base
    : `${base} translate(${p.cx.toFixed(2)} ${p.cy.toFixed(2)}) scale(${scale.toFixed(3)}) translate(${(-p.cx).toFixed(2)} ${(-p.cy).toFixed(2)})`
}

/**
 * Birleşme süresi (sn) — tüm sahneler aynı ritmi paylaşır. "Elde diziliyormuş" hissi için
 * yeterince uzun: parçalar tek tek yerleşir, form merkezden dışa doğru yavaşça dolar.
 */
export const SNAP = 1.5

const smooth = (a: number, b: number, x: number) => {
  const k = Math.min(1, Math.max(0, (x - a) / (b - a)))
  return k * k * (3 - 2 * k)
}
const easeInOutSine = (x: number) => -(Math.cos(Math.PI * x) - 1) / 2

/**
 * Birleşmenin `s` (0→1) anındaki sahne değerleri.
 * Form, merkezden dışa doğru yumuşak kenarlı bir maskeyle tek parça olarak dolar
 * (`reveal`); iç çizgisi olmadığı için hangi bölgenin hangi parçadan geldiği okunamaz.
 */
export function snapLook(s: number) {
  const e = easeInOutSine(s)
  return {
    piles: { opacity: 1, blur: 0, scale: 1 - 0.05 * e },
    // Bulanıklık filtresi yok: yumuşaklığı maskenin kenarı veriyor. 1.5 sn boyunca büyük bir
    // sahnede filtre + maske birlikte, kaydırma sırasında kare düşürüyordu.
    form: { opacity: smooth(0, 0.22, s), blur: 0, scale: 1 + 0.025 * (1 - e), reveal: e },
    // Formun arkasında yavaşça kabarıp sönen yumuşak bir ışıma
    glow: Math.sin(Math.PI * s) * 0.38,
  }
}

/**
 * Yığındaki parçaların tek tek "kullanılması": her parça, çözümden BAĞIMSIZ karışık bir
 * sırayla, kendi yerinde hafifçe küçülerek söner. Hiçbiri yuvasına doğru hareket etmez.
 */
export function pieceFade(s: number, i: number, n: number) {
  const order = (i * 5 + 2) % n
  const start = (order / n) * 0.62
  const k = smooth(start, start + 0.3, s)
  return { opacity: 1 - k, scale: 1 - 0.12 * k }
}

/** Formun dolma maskesi için yumuşak kenarlı radyal degrade */
export function RevealGradient({ id }: { id: string }) {
  return (
    <radialGradient id={id}>
      <stop offset="0%" stopColor="#fff" />
      <stop offset="62%" stopColor="#fff" />
      <stop offset="100%" stopColor="#000" />
    </radialGradient>
  )
}

/** Maske dairesinin, formu tamamen kaplaması için gereken yarıçapı (`fit` cinsinden) */
export const REVEAL_RADIUS = 1.25

/* ── Ortak çizim parçaları ─────────────────────────────────────── */

/** Akrilik parça: yarı saydam dolgu, kesim kenarı ve cam parlaması */
export function AcrylicPiece({ points, tint, shineId }: { points: string; tint: Tint; shineId: string }) {
  return (
    <>
      <polygon points={points} fill={tint.fill} stroke={tint.stroke} strokeWidth={0.9} strokeLinejoin="round" />
      <polygon points={points} fill={`url(#${shineId})`} pointerEvents="none" />
    </>
  )
}

/** Parçanın masaya düşen gölgesi — filtre yok, yalnızca kaydırılmış yarı saydam bir kopya */
export function PieceShadow({ points }: { points: string }) {
  return <polygon points={points} transform="translate(0.7 1.6)" fill="rgba(90,40,10,0.13)" stroke="rgba(90,40,10,0.06)" strokeWidth={1.4} strokeLinejoin="round" />
}

/** Cam parlaması: tüm sahneye yayılan tek degrade (userSpaceOnUse) */
export function ShineGradient({ id }: { id: string }) {
  return (
    <linearGradient id={id} gradientUnits="userSpaceOnUse" x1="40" y1="30" x2="160" y2="170">
      <stop offset="0%" stopColor="#fff" stopOpacity="0.42" />
      <stop offset="45%" stopColor="#fff" stopOpacity="0.06" />
      <stop offset="100%" stopColor="#fff" stopOpacity="0" />
    </linearGradient>
  )
}

/** Kilitlenme ışıması için yumuşak radyal degrade */
export function GlowGradient({ id, tint }: { id: string; tint: Tint }) {
  return (
    <radialGradient id={id}>
      <stop offset="0%" stopColor="#fff" stopOpacity="0.95" />
      <stop offset="45%" stopColor={tint.ink} stopOpacity="0.18" />
      <stop offset="100%" stopColor={tint.ink} stopOpacity="0" />
    </radialGradient>
  )
}

/**
 * Çözülmüş form: tek parça akrilik (gölge + dolgu + parlama + yalnızca dış kontur).
 * İç kesim çizgisi YOKTUR — nasıl birleştiği görünmez.
 */
export function FormSilhouette({ d, tint, shineId }: { d: string; tint: Tint; shineId: string }) {
  return (
    <>
      <path d={d} fillRule="evenodd" transform="translate(0.7 1.6)" fill="rgba(90,40,10,0.13)" />
      <path d={d} fillRule="evenodd" fill={tint.fill} />
      <path d={d} fillRule="evenodd" fill={`url(#${shineId})`} pointerEvents="none" />
      <path d={d} fillRule="evenodd" fill="none" stroke={tint.stroke} strokeWidth={0.9} strokeLinejoin="round" />
    </>
  )
}

/** Hedef silüet — kutunun üzerindeki şekil gibi kesik çizgiyle masaya basılmış */
export function TargetGhost({ d, tint, opacity = 1 }: { d: string; tint: Tint; opacity?: number }) {
  return (
    <path
      d={d}
      fillRule="evenodd"
      fill={tint.ink}
      fillOpacity={0.06 * opacity}
      stroke={tint.ink}
      strokeOpacity={0.45 * opacity}
      strokeWidth={0.9}
      strokeDasharray="3 3"
      strokeLinejoin="round"
    />
  )
}
