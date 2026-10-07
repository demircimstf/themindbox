import { memo, useEffect, useId, useLayoutEffect, useMemo, useRef } from 'react'
import { useReducedMotion } from 'motion/react'
import type { ProductArt as ArtKind } from '@/data/products'
import {
  AcrylicPiece,
  FormSilhouette,
  GlowGradient,
  REVEAL_RADIUS,
  RevealGradient,
  PieceShadow,
  SHAPES,
  SNAP,
  ShineGradient,
  TargetGhost,
  chaosTransform,
  layoutShape,
  pieceFade,
  snapLook,
} from './puzzles'

interface Props {
  kind: ArtKind
  /** true → yığın bütün olarak çözülür, form tek parça belirir; false → form dağılır, yığın geri gelir */
  formed: boolean
  /** Form oluşmamışken yığın çalkalansın mı (false → durağan yığın, döngü durur) */
  tumble?: boolean
  /** Bağlandığında yığın görünmezden belirsin */
  appear?: boolean
  fit?: number
  spread?: number
  /**
   * Zengin birleşme efektleri (bulanıklık + merkezden dolan maske). Büyük, tekil sahnelerde
   * (Hero) açık; aynı anda birden çok kartın birleşebildiği ızgaralarda kapalı — filtre ve
   * maske her karede yeniden rasterleşir. Kapalıyken form, kademeli bir opaklıkla dolar.
   */
  blur?: boolean
  className?: string
  label?: string
}

const APPEAR = 0.6

/**
 * "Kaostan düzene" sahnesi. Parçalar hiçbir zaman yuvalarına yürümez: merkezde üst üste
 * binmiş bir yığın olarak çalkalanır; kilitlenme anında yığın içe çöküp bulanıklaşarak
 * söner ve hedef form, tek parça olarak bulanıklıktan netleşerek var olur.
 *
 * Performans: tek bir rAF döngüsü öznitelikleri doğrudan DOM'a yazar; sahne durağan
 * olduğunda (form oluştu ya da yığın durdu) döngü tamamen durur.
 */
export const PuzzleScene = memo(function PuzzleScene({
  kind,
  formed,
  tumble = true,
  appear = true,
  fit = 112,
  spread = 30,
  blur: useBlur = true,
  className,
  label,
}: Props) {
  const def = SHAPES[kind]
  const layout = useMemo(() => layoutShape(def, { fit, spread }), [def, fit, spread])
  const uid = useId().replace(/:/g, '')
  const reduce = useReducedMotion()
  const [cx, cy] = layout.center

  const ghostRef = useRef<SVGGElement>(null)
  const glowRef = useRef<SVGCircleElement>(null)
  const revealRef = useRef<SVGCircleElement>(null)
  const pilesRef = useRef<SVGGElement>(null)
  const formRef = useRef<SVGGElement>(null)
  const pieceRefs = useRef<(SVGGElement | null)[]>([])
  const shadowRefs = useRef<(SVGGElement | null)[]>([])

  // Sahne durumu (React state değil — her karede render olmasın)
  const st = useRef({ s: 0, t: 0, a: appear ? 0 : 1 })

  const scaleAbout = (k: number) => `translate(${cx} ${cy}) scale(${k.toFixed(4)}) translate(${-cx} ${-cy})`
  const blur = (b: number) => (useBlur && b > 0.05 ? `blur(${b.toFixed(2)}px)` : 'none')

  const paint = () => {
    const { s, t, a } = st.current
    const look = snapLook(s)
    // Parçalar karışık bir sırayla, kendi yerlerinde küçülerek tek tek söner
    const n = layout.pieces.length
    layout.pieces.forEach((p, i) => {
      const fade = pieceFade(s, i, n)
      const tr = chaosTransform(p, i, t, 1, fade.scale)
      for (const el of [pieceRefs.current[i], shadowRefs.current[i]]) {
        el?.setAttribute('transform', tr)
        // Hafif modda (ızgara kartları) parça başına opaklık yok: aynı anda birçok kart
        // birleşebilir. Parçalar yine tek tek küçülür; sönme yığın katmanında yapılır.
        if (useBlur) el?.setAttribute('opacity', fade.opacity.toFixed(3))
      }
    })
    const piles = pilesRef.current
    if (piles) {
      const op = (useBlur ? look.piles.opacity : 1 - look.form.reveal) * a
      piles.setAttribute('opacity', op.toFixed(3))
      piles.setAttribute('visibility', op < 0.005 ? 'hidden' : 'visible')
      piles.setAttribute('transform', scaleAbout(look.piles.scale))
      piles.style.filter = blur(look.piles.blur)
    }
    const form = formRef.current
    if (form) {
      // Hafif modda form, maske yerine birleşmeyle eşzamanlı kademeli bir opaklıkla dolar
      const op = useBlur ? look.form.opacity : look.form.reveal
      form.setAttribute('opacity', op.toFixed(3))
      form.setAttribute('visibility', op < 0.005 ? 'hidden' : 'visible')
      form.setAttribute('transform', scaleAbout(look.form.scale))
      form.style.filter = blur(look.form.blur)
    }
    // Form, merkezden dışa doğru yumuşak kenarla dolar (hafif modda maske yok)
    if (useBlur) revealRef.current?.setAttribute('r', (look.form.reveal * fit * REVEAL_RADIUS).toFixed(2))
    glowRef.current?.setAttribute('opacity', look.glow.toFixed(3))
    ghostRef.current?.setAttribute('opacity', ((1 - s) * a).toFixed(3))
  }

  // Yeni şekil: yığın baştan (boyamadan önce)
  useLayoutEffect(() => {
    st.current = { s: 0, t: 0, a: appear && !reduce ? 0 : 1 }
    paint()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [layout])

  useEffect(() => {
    const target = formed ? 1 : 0
    let raf = 0
    let last = performance.now()
    const tick = (now: number) => {
      const dt = Math.min(64, now - last) / 1000
      last = now
      const cur = st.current
      cur.a = reduce ? 1 : Math.min(1, cur.a + dt / APPEAR)
      if (reduce) cur.s = target
      // Birleşme yavaş ve hissedilir; dağılma daha çabuk
      else cur.s = target ? Math.min(1, cur.s + dt / SNAP) : Math.max(0, cur.s - dt / (SNAP * 0.6))
      const tumbling = !reduce && cur.s < 1 && (tumble || cur.s > 0)
      if (tumbling) cur.t += dt
      paint()
      if (cur.s !== target || cur.a < 1 || (tumbling && !formed)) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formed, tumble, layout, reduce])

  return (
    <svg
      viewBox="0 0 200 200"
      className={className}
      fill="none"
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <ShineGradient id={`${uid}-shine`} />
        <GlowGradient id={`${uid}-glow`} tint={def.tint} />
        <RevealGradient id={`${uid}-reveal-g`} />
        <mask id={`${uid}-reveal`} maskUnits="userSpaceOnUse" x="0" y="0" width="200" height="200">
          <circle ref={revealRef} cx={cx} cy={cy} r={0} fill={`url(#${uid}-reveal-g)`} />
        </mask>
      </defs>

      <g ref={ghostRef}>
        <TargetGhost d={layout.outlinePath} tint={def.tint} />
      </g>
      <circle ref={glowRef} cx={cx} cy={cy} r={fit * 0.62} fill={`url(#${uid}-glow)`} opacity={0} />

      {/* Darmadağınık yığın: önce tüm gölgeler, sonra parçalar */}
      <g ref={pilesRef}>
        {layout.pieces.map((p, i) => (
          <g key={`s${i}`} ref={(el) => void (shadowRefs.current[i] = el)}>
            <PieceShadow points={p.points} />
          </g>
        ))}
        {layout.pieces.map((p, i) => (
          <g key={i} ref={(el) => void (pieceRefs.current[i] = el)}>
            <AcrylicPiece points={p.points} tint={def.tint} shineId={`${uid}-shine`} />
          </g>
        ))}
      </g>

      {/* Tek parça form — iç kesim çizgisi yok */}
      <g ref={formRef} opacity={0} visibility="hidden">
        <g mask={useBlur ? `url(#${uid}-reveal)` : undefined}>
          <FormSilhouette d={layout.outlinePath} tint={def.tint} shineId={`${uid}-shine`} />
        </g>
      </g>
    </svg>
  )
})
