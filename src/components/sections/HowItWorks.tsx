import { memo, useCallback, useId, useImperativeHandle, useLayoutEffect, useMemo, useRef, useState, type ReactNode, type RefObject } from 'react'
import { AnimatePresence, motion, useAnimationFrame, useInView, useReducedMotion } from 'motion/react'
import { Check, Pause, Play, RotateCcw } from 'lucide-react'
import { site } from '@/data/site'
import { cn } from '@/lib/cn'
import { ease, spring } from '@/lib/motion'
import { SectionLabel } from '@/components/ui/SectionLabel'
import { Reveal, SplitWords } from '@/components/ui/Reveal'
import {
  AcrylicPiece,
  FormSilhouette,
  GlowGradient,
  REVEAL_RADIUS,
  RevealGradient,
  PieceShadow,
  SHAPES,
  SHAPE_ORDER,
  SNAP,
  ShineGradient,
  TargetGhost,
  chaosAt,
  layoutShape,
  pieceFade,
  snapLook,
  type Layout,
  type PieceLayout,
  type ShapeDef,
} from '@/components/visual/puzzles'

/* ─────────────────────────────────────────────────────────────
   Koreografi: kutuyu aç → parçaları masaya dök → şekli tamamla.
   Parçalar kutudan merkezde üst üste binen darmadağınık bir yığına dökülür,
   bir süre çalkalanır ve tek hamlede (içe çöküş + bulanıklık + ışıma) hedef
   forma dönüşür. Hiçbir parça yuvasına yürümez — çözüm hiçbir an görünmez.
   Her şey tek bir zaman değerinden (saniye) hesaplanır.
   ───────────────────────────────────────────────────────────── */
const T = { idle: 0.6, lid: 0.9, pour: 0.9, pourGap: 0.07, chaos: 1.6, hold: 2.2, reset: 0.6 }
const BOX = { x: 100, y: 112 } // kutu ağzının merkezi
const SCENE_CENTER: [number, number] = [100, 102]
const FORM_FIT = 118
const center = SCENE_CENTER

const clamp01 = (v: number) => Math.min(1, Math.max(0, v))
const easeOut = (p: number) => 1 - Math.pow(1 - p, 3)
const easeInOut = (p: number) => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2)
const lerp = (a: number, b: number, t: number) => a + (b - a) * t

function timeline(n: number) {
  const pourAt = T.idle + T.lid * 0.75
  const asmAt = pourAt + (n - 1) * T.pourGap + T.pour // yığın masada: çalkalanma başlar
  const snapAt = asmAt + T.chaos
  const doneAt = snapAt + SNAP
  const resetAt = doneAt + T.hold
  return { pourAt, asmAt, snapAt, doneAt, resetAt, duration: resetAt + T.reset }
}

const STEPS = [
  { title: 'Kutuyu aç', body: 'Her kutunun kapağında tek bir hedef var: oluşturman gereken şekil.' },
  { title: 'Parçaları masaya dök', body: '7–8 özel kesim akrilik parça, karmakarışık. Hiçbiri tek başına bir şey anlatmaz.' },
  { title: 'Şekli tamamla', body: 'Doğru düzen bulunduğu an parçalar tek bir forma dönüşür. Nasıl mı? Kutu söylemez.' },
]

function frameAt(layout: Layout, t: number) {
  const n = layout.pieces.length
  const tl = timeline(n)
  const lid = easeInOut(clamp01((t - T.idle) / T.lid))
  const reset = clamp01((t - tl.resetAt) / T.reset)

  const s = clamp01((t - tl.snapAt) / SNAP)
  const pieces = layout.pieces.map((p, i) => {
    const pour = easeOut(clamp01((t - tl.pourAt - i * T.pourGap) / T.pour))
    // Birleşmede parça, karışık bir sırayla kendi yerinde küçülerek söner
    const fade = pieceFade(s, i, n)
    // Yığındaki konum + çalkalanma (dökülürken şiddeti kademeli artar)
    const c = chaosAt(p, i, Math.max(0, t - tl.pourAt), pour)
    return {
      x: lerp(BOX.x - p.cx, c.x, pour),
      y: lerp(BOX.y - p.cy, c.y, pour),
      rotate: lerp(p.pile.rotate * 1.6, c.rotate, pour),
      scale: lerp(0.25, 1, pour) * fade.scale,
      opacity: clamp01(pour * 4) * fade.opacity,
    }
  })

  const pourAvg = clamp01((t - tl.pourAt) / (T.pour + (n - 1) * T.pourGap))
  const look = snapLook(s)
  return {
    pieces,
    lid,
    look,
    reset,
    box: t < tl.resetAt ? 1 - easeOut(pourAvg) : easeOut(reset),
    // Hedef çizgisi (kapaktaki şekil) form belirince geri çekilir
    ghost: clamp01((t - tl.pourAt) / 0.6) * (1 - s),
    done: t >= tl.doneAt && t < tl.resetAt,
    active: t < tl.pourAt ? 0 : t < tl.asmAt ? 1 : 2,
    fills: [clamp01(t / tl.pourAt), clamp01((t - tl.pourAt) / (tl.asmAt - tl.pourAt)), clamp01((t - tl.asmAt) / (tl.doneAt - tl.asmAt))],
    duration: tl.duration,
    doneAt: tl.doneAt,
  }
}

type Frame = ReturnType<typeof frameAt>
interface SceneApi {
  apply: (f: Frame) => void
}

export function HowItWorks() {
  const video = site.howItWorksVideo
  const reduce = useReducedMotion()
  const sectionRef = useRef<HTMLElement>(null)
  // Ekranda değilken saat durur — işlemci ve pil dostu
  const inView = useInView(sectionRef, { amount: 0.25 })

  const [shapeIndex, setShapeIndex] = useState(0)
  const def = SHAPES[SHAPE_ORDER[shapeIndex]]
  const layout = useMemo(() => layoutShape(def, { fit: FORM_FIT, center: SCENE_CENTER, spread: 32 }), [def])
  const tl = useMemo(() => timeline(layout.pieces.length), [layout])
  const [playing, setPlaying] = useState(!reduce)

  /*
   * Performans: zaman React state'i DEĞİL. Her karede konumlar doğrudan DOM'a yazılır
   * (sceneRef.apply, ilerleme çubukları). React yalnızca ayrık değerler değiştiğinde
   * (etkin adım, tamamlandı, şekil) yeniden çizer — döngü başına ~4 render, ~600 değil.
   */
  const timeRef = useRef(reduce ? tl.doneAt + 0.1 : 0)
  const sceneRef = useRef<SceneApi | null>(null)
  const fillRefs = useRef<(HTMLDivElement | null)[]>([])
  const progressRef = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(0)
  const [done, setDone] = useState(false)
  const discrete = useRef({ active: -1, done: false })

  const paint = useCallback(
    (t: number) => {
      const f = frameAt(layout, t)
      sceneRef.current?.apply(f)
      f.fills.forEach((v, i) => {
        const el = fillRefs.current[i]
        if (el) el.style.transform = `scaleX(${v})`
      })
      if (progressRef.current) progressRef.current.style.transform = `scaleX(${t / f.duration})`
      if (f.active !== discrete.current.active) setActive((discrete.current.active = f.active))
      if (f.done !== discrete.current.done) setDone((discrete.current.done = f.done))
    },
    [layout],
  )

  const seek = useCallback(
    (t: number) => {
      timeRef.current = t
      paint(t)
    },
    [paint],
  )

  // Şekil değişince (yeni DOM hazır olduğunda, boyamadan önce) ilk kareyi uygula
  useLayoutEffect(() => paint(timeRef.current), [paint])

  useAnimationFrame((_, delta) => {
    if (!playing || !inView || video) return
    // Sekme arka plandan dönünce büyük bir sıçrama olmasın
    const next = timeRef.current + Math.min(delta, 64) / 1000
    if (next < tl.duration) return seek(next)
    // Döngü bitti: bir sonraki şekle geç
    timeRef.current = 0
    setShapeIndex((i) => (i + 1) % SHAPE_ORDER.length)
  })

  const choose = useCallback(
    (i: number) => {
      const start = reduce ? timeline(SHAPES[SHAPE_ORDER[i]].pieces.length).doneAt + 0.1 : 0
      if (i === shapeIndex) return seek(start)
      timeRef.current = start
      setShapeIndex(i)
    },
    [reduce, seek, shapeIndex],
  )
  const jump = useCallback((i: number) => seek([0, tl.pourAt, tl.asmAt][i]), [seek, tl])
  const toggle = useCallback(() => setPlaying((p) => !p), [])
  const restart = useCallback(() => {
    seek(0)
    setPlaying(true)
  }, [seek])

  return (
    <section id="nasil-calisir" ref={sectionRef} className="relative overflow-hidden py-28 md:py-40">
      {/* Mobilde sıra: başlık → demo → adımlar. Masaüstünde demo sağda iki satırı kaplar. */}
      <div className="mx-auto grid max-w-7xl gap-10 px-5 sm:px-8 lg:grid-cols-12 lg:gap-x-10 lg:gap-y-10">
        <div className="lg:col-span-4 lg:col-start-1 lg:row-start-1">
          <SectionLabel index="01" className="mb-8">
            Nasıl çalışır
          </SectionLabel>
          <h2 className="display text-[clamp(2.25rem,4.4vw,3.75rem)] leading-[1] text-graphite-950">
            <SplitWords text="Aç, dök," className="block" />
            <SplitWords text="tamamla." delay={0.1} className="block text-graphite-400" />
          </h2>
          <Reveal delay={0.1} className="mt-6 max-w-sm text-[15px] leading-relaxed text-graphite-500">
            Brain Fitness: bir kutu, bir hedef şekil ve birkaç akrilik parça. Kural basit — çözüm değil.
          </Reveal>
        </div>

        <Reveal delay={0.1} className="lg:col-span-8 lg:col-start-5 lg:row-span-2 lg:row-start-1 lg:self-center">
          <AcrylicFrame>
            {video ? (
              <video
                className="absolute inset-0 size-full object-cover"
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
                poster={video.poster}
              >
                {video.webm && <source src={video.webm} type="video/webm" />}
                <source src={video.mp4} type="video/mp4" />
              </video>
            ) : (
              <>
                <div className="absolute inset-0 flex items-center justify-center px-[4%] pb-[13%] pt-[10%]">
                  <DemoScene def={def} layout={layout} apiRef={sceneRef} />
                </div>

                <div className="absolute inset-x-5 top-5 flex items-start justify-between sm:inset-x-7 sm:top-7">
                  <span className="label flex items-center gap-2.5">
                    <span className="relative flex size-1.5">
                      {playing && <span className="absolute inset-0 animate-ping rounded-full bg-acrylic/60" />}
                      <span className="relative size-1.5 rounded-full bg-acrylic" />
                    </span>
                    {playing ? 'Canlı demo' : 'Duraklatıldı'}
                  </span>
                  <TargetBadge def={def} done={done} />
                </div>

                <Controls playing={playing} progressRef={progressRef} onToggle={toggle} onRestart={restart} />
              </>
            )}
          </AcrylicFrame>
        </Reveal>

        {!video && (
          <div className="lg:col-span-4 lg:col-start-1 lg:row-start-2">
            <Reveal delay={0.15}>
              <ShapeTabs index={shapeIndex} onChange={choose} />
            </Reveal>
            <Reveal delay={0.2} className="mt-8">
              <StepList active={active} fillRefs={fillRefs} onJump={jump} />
            </Reveal>
          </div>
        )}
      </div>
    </section>
  )
}

const pieceTransform = (p: PieceLayout, f: Frame['pieces'][number]) =>
  `translate(${f.x.toFixed(2)} ${f.y.toFixed(2)}) rotate(${f.rotate.toFixed(2)} ${p.cx.toFixed(2)} ${p.cy.toFixed(2)}) ` +
  `translate(${p.cx.toFixed(2)} ${p.cy.toFixed(2)}) scale(${f.scale.toFixed(3)}) translate(${(-p.cx).toFixed(2)} ${(-p.cy).toFixed(2)})`

const scaleAbout = (k: number) => `translate(${center[0]} ${center[1]}) scale(${k.toFixed(4)}) translate(${-center[0]} ${-center[1]})`
const blurOf = (b: number) => (b > 0.05 ? `blur(${b.toFixed(2)}px)` : 'none')

/**
 * Sahne bir kez çizilir; sonrası tamamen imperatif. `apiRef.apply(frame)` her karede
 * yalnızca transform/opacity/filter özniteliklerini günceller.
 */
const DemoScene = memo(function DemoScene({
  def,
  layout,
  apiRef,
}: {
  def: ShapeDef
  layout: Layout
  apiRef: RefObject<SceneApi | null>
}) {
  const uid = useId().replace(/:/g, '')
  const ghostRef = useRef<SVGGElement>(null)
  const boxRef = useRef<SVGGElement>(null)
  const lidRef = useRef<SVGGElement>(null)
  const pilesRef = useRef<SVGGElement>(null)
  const formRef = useRef<SVGGElement>(null)
  const glowRef = useRef<SVGCircleElement>(null)
  const revealRef = useRef<SVGCircleElement>(null)
  const pieceRefs = useRef<(SVGGElement | null)[]>([])
  const shadowRefs = useRef<(SVGGElement | null)[]>([])

  useImperativeHandle(
    apiRef,
    () => ({
      apply(f) {
        ghostRef.current?.setAttribute('opacity', f.ghost.toFixed(3))
        const box = boxRef.current
        if (box) {
          box.setAttribute('visibility', f.box <= 0.01 ? 'hidden' : 'visible')
          box.setAttribute('opacity', f.box.toFixed(3))
          box.setAttribute('transform', `translate(0 ${((1 - f.box) * 10).toFixed(2)})`)
        }
        const lid = lidRef.current
        if (lid) {
          lid.setAttribute('transform', `translate(${f.lid * 26} ${-f.lid * 46}) rotate(${-f.lid * 16} 100 104)`)
          lid.setAttribute('opacity', (1 - f.lid * 0.85).toFixed(3))
        }

        // Yığın: parçalar kendi yerlerinde çalkalanır; kilitlenmede bütün olarak çöker
        layout.pieces.forEach((p, i) => {
          const pf = f.pieces[i]
          const tr = pieceTransform(p, pf)
          for (const el of [pieceRefs.current[i], shadowRefs.current[i]]) {
            el?.setAttribute('transform', tr)
            el?.setAttribute('opacity', pf.opacity.toFixed(3))
          }
        })
        const piles = pilesRef.current
        if (piles) {
          piles.setAttribute('opacity', f.look.piles.opacity.toFixed(3))
          piles.setAttribute('visibility', f.look.piles.opacity < 0.005 ? 'hidden' : 'visible')
          piles.setAttribute('transform', scaleAbout(f.look.piles.scale))
          piles.style.filter = blurOf(f.look.piles.blur)
        }

        // Form: bulanıklıktan netleşerek tek parça var olur; sıfırlanırken söner
        const form = formRef.current
        if (form) {
          const op = f.look.form.opacity * (1 - f.reset)
          form.setAttribute('opacity', op.toFixed(3))
          form.setAttribute('visibility', op < 0.005 ? 'hidden' : 'visible')
          form.setAttribute('transform', scaleAbout(f.look.form.scale))
          form.style.filter = blurOf(f.look.form.blur)
        }
        // Form, merkezden dışa doğru yumuşak kenarla dolar
        revealRef.current?.setAttribute('r', (f.look.form.reveal * FORM_FIT * REVEAL_RADIUS).toFixed(2))
        glowRef.current?.setAttribute('opacity', f.look.glow.toFixed(3))
      },
    }),
    [layout],
  )

  return (
    <svg viewBox="0 0 200 200" className="size-full overflow-visible" role="img" aria-label={`${def.name} bulmacasının çözüm animasyonu`}>
      <defs>
        <ShineGradient id={`${uid}-shine`} />
        <GlowGradient id={`${uid}-glow`} tint={def.tint} />
        <RevealGradient id={`${uid}-reveal-g`} />
        <mask id={`${uid}-reveal`} maskUnits="userSpaceOnUse" x="0" y="0" width="200" height="200">
          <circle ref={revealRef} cx={center[0]} cy={center[1]} r={0} fill={`url(#${uid}-reveal-g)`} />
        </mask>
        <radialGradient id={`${uid}-floor`}>
          <stop offset="0%" stopColor="rgb(60,45,30)" stopOpacity="0.16" />
          <stop offset="100%" stopColor="rgb(60,45,30)" stopOpacity="0" />
        </radialGradient>
      </defs>

      <g ref={ghostRef} opacity={0}>
        <TargetGhost d={layout.outlinePath} tint={def.tint} />
      </g>

      <MindBox def={def} boxRef={boxRef} lidRef={lidRef} floorId={`${uid}-floor`} />

      <circle ref={glowRef} cx={center[0]} cy={center[1]} r={74} fill={`url(#${uid}-glow)`} opacity={0} />

      {/* Darmadağınık yığın: önce tüm gölgeler, sonra parçalar */}
      <g ref={pilesRef}>
        {layout.pieces.map((p, i) => (
          <g key={`s${i}`} ref={(el) => void (shadowRefs.current[i] = el)} opacity={0}>
            <PieceShadow points={p.points} />
          </g>
        ))}
        {layout.pieces.map((p, i) => (
          <g key={i} ref={(el) => void (pieceRefs.current[i] = el)} opacity={0}>
            <AcrylicPiece points={p.points} tint={def.tint} shineId={`${uid}-shine`} />
          </g>
        ))}
      </g>

      {/* Tek parça form — iç kesim çizgisi yok */}
      <g ref={formRef} opacity={0} visibility="hidden">
        <g mask={`url(#${uid}-reveal)`}>
          <FormSilhouette d={layout.outlinePath} tint={def.tint} shineId={`${uid}-shine`} />
        </g>
      </g>
    </svg>
  )
})

/** Önden görünen ürün kutusu: gövdesinde hedef sembol baskılı */
function MindBox({
  def,
  boxRef,
  lidRef,
  floorId,
}: {
  def: ShapeDef
  boxRef: RefObject<SVGGElement | null>
  lidRef: RefObject<SVGGElement | null>
  floorId: string
}) {
  const icon = useMemo(() => layoutShape(def, { fit: 26, center: [100, 128] }).outlinePath, [def])
  return (
    <g ref={boxRef}>
      {/* Zemin gölgesi: blur filtresi yerine radyal degrade — her karede yeniden hesaplanmaz */}
      <ellipse cx={100} cy={156} rx={56} ry={6} fill={`url(#${floorId})`} />
      <rect x={54} y={104} width={92} height={50} rx={3} fill="#fbf8f2" stroke="rgba(35,33,30,.28)" strokeWidth={0.8} />
      <path d={icon} fillRule="evenodd" fill={def.tint.ink} opacity={0.9} />
      <text x={100} y={148} textAnchor="middle" fontFamily="Geist Mono, monospace" fontSize={4.2} letterSpacing={1.2} fill="#6e685f">
        THE MIND BOX · IQ PUZZLE
      </text>
      {/* Kapak: yukarı kalkar ve hafifçe döner */}
      <g ref={lidRef}>
        <rect x={50} y={94} width={100} height={13} rx={2.5} fill="#ffffff" stroke="rgba(35,33,30,.3)" strokeWidth={0.8} />
        <rect x={50} y={94} width={100} height={3} rx={1.5} fill={def.tint.ink} opacity={0.85} />
      </g>
    </g>
  )
}

/** Sağ üst köşe: hedef şeklin küçük resmi — tamamlanınca onay işareti */
const TargetBadge = memo(function TargetBadge({ def, done }: { def: ShapeDef; done: boolean }) {
  const d = useMemo(() => layoutShape(def, { fit: 20, center: [12, 12] }).outlinePath, [def])
  return (
    <span className="flex items-center gap-2.5">
      <span className="label hidden text-right sm:block">
        Hedef
        <span className="block text-graphite-900">{def.name}</span>
      </span>
      <span
        className={cn(
          'relative grid size-10 place-items-center rounded-xl border bg-white/70 backdrop-blur transition-colors duration-500',
          done ? 'border-acrylic/50' : 'border-graphite-900/10',
        )}
      >
        <svg viewBox="0 0 24 24" className="size-6" aria-hidden>
          <path d={d} fillRule="evenodd" fill={def.tint.ink} opacity={0.85} />
        </svg>
        <AnimatePresence>
          {done && (
            <motion.span
              className="absolute -right-1.5 -top-1.5 grid size-5 place-items-center rounded-full bg-acrylic text-white"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={spring.snappy}
            >
              <Check className="size-3" strokeWidth={2.5} />
            </motion.span>
          )}
        </AnimatePresence>
      </span>
    </span>
  )
})

/** Fildişi zemin üzerinde buzlu akrilik bir kasa: dış cam halka + iç sahne */
function AcrylicFrame({ children }: { children: ReactNode }) {
  return (
    <div className="relative">
      {/* Camın arkasında yumuşak bir turuncu ışık — buzlanmayı görünür kılar */}
      <div aria-hidden className="pointer-events-none absolute -inset-10 -z-10">
        <div className="absolute left-[12%] top-[18%] size-[46%] rounded-full bg-acrylic-soft/30 blur-3xl" />
        <div className="absolute bottom-[8%] right-[10%] size-[40%] rounded-full bg-white blur-3xl" />
      </div>
      <div className="rounded-[34px] border border-white/80 bg-white/40 p-2 shadow-[0_40px_90px_-40px_rgba(60,45,30,0.45),inset_0_1px_0_rgba(255,255,255,0.9)] backdrop-blur-xl sm:p-2.5">
        <div className="relative aspect-square overflow-hidden rounded-[27px] border border-graphite-900/[0.06] bg-gradient-to-b from-paper-50 via-paper-100 to-paper-200 [contain:layout_paint] [transform:translateZ(0)] sm:aspect-[4/3]">
          {/* Masa yüzeyi: ince ızgaralı kesim matı */}
          <div
            aria-hidden
            className="absolute inset-0 opacity-60 [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_80%)]"
            style={{
              backgroundImage:
                'linear-gradient(to right, rgba(35,33,30,.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(35,33,30,.05) 1px, transparent 1px)',
              backgroundSize: '28px 28px',
            }}
          />
          {/* Cam yansıması */}
          <div aria-hidden className="pointer-events-none absolute -left-1/4 -top-1/2 h-full w-[150%] rotate-[-8deg] bg-gradient-to-b from-white/50 to-transparent" />
          {children}
        </div>
      </div>
    </div>
  )
}

const ShapeTabs = memo(function ShapeTabs({ index, onChange }: { index: number; onChange: (i: number) => void }) {
  return (
    <div role="tablist" aria-label="Şekil seç" className="grid w-full max-w-sm grid-cols-2 gap-1 rounded-[22px] border border-graphite-900/10 bg-white/50 p-1">
      {SHAPE_ORDER.map((id, i) => {
        const selected = i === index
        return (
          <button
            key={id}
            role="tab"
            aria-selected={selected}
            onClick={() => onChange(i)}
            className={cn(
              'relative h-9 w-full rounded-full px-3.5 text-[13px] font-medium transition-[color,transform] duration-200 ease-out-strong active:scale-[0.96]',
              selected ? 'text-paper-50' : 'text-graphite-500 hover:text-graphite-900',
            )}
          >
            {selected && <motion.span layoutId="shape-tab" className="absolute inset-0 rounded-full bg-graphite-900" transition={spring.snappy} />}
            <span className="relative">{SHAPES[id].name}</span>
          </button>
        )
      })}
    </div>
  )
})

const StepList = memo(function StepList({
  active,
  fillRefs,
  onJump,
}: {
  active: number
  fillRefs: RefObject<(HTMLDivElement | null)[]>
  onJump: (i: number) => void
}) {
  return (
    <ol className="flex flex-col">
      {STEPS.map((s, i) => {
        const isActive = i === active
        return (
          <li key={s.title}>
            <button onClick={() => onJump(i)} className="group w-full py-3.5 text-left">
              <div className="flex items-baseline gap-4">
                <span className={cn('label w-5 tabular-nums transition-colors duration-300', isActive && 'text-acrylic')}>
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="flex-1">
                  <span
                    className={cn(
                      'block text-[15px] font-medium tracking-[-0.01em] transition-colors duration-300',
                      isActive ? 'text-graphite-950' : 'text-graphite-400 group-hover:text-graphite-700',
                    )}
                  >
                    {s.title}
                  </span>
                  {/* Açıklama yalnızca etkin adımda açılır */}
                  <AnimatePresence initial={false}>
                    {isActive && (
                      <motion.span
                        className="block overflow-hidden"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.4, ease: ease.out }}
                      >
                        <span className="block pt-1.5 text-sm leading-relaxed text-graphite-500">{s.body}</span>
                      </motion.span>
                    )}
                  </AnimatePresence>
                </span>
              </div>
              <div className="ml-9 mt-3 h-px bg-graphite-900/10">
                <div ref={(el) => void (fillRefs.current[i] = el)} className="h-px origin-left bg-graphite-900" />
              </div>
            </button>
          </li>
        )
      })}
    </ol>
  )
})

const Controls = memo(function Controls({
  playing,
  progressRef,
  onToggle,
  onRestart,
}: {
  playing: boolean
  progressRef: RefObject<HTMLDivElement | null>
  onToggle: () => void
  onRestart: () => void
}) {
  const btn =
    'grid size-10 place-items-center rounded-full border border-graphite-900/10 bg-white/70 text-graphite-900 backdrop-blur ' +
    'transition-[transform,background-color] duration-200 ease-out-strong hover:bg-white active:scale-[0.94]'
  return (
    <div className="absolute inset-x-5 bottom-5 flex items-center gap-3 sm:inset-x-7 sm:bottom-7">
      <button onClick={onToggle} aria-label={playing ? 'Duraklat' : 'Oynat'} className={btn}>
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={playing ? 'pause' : 'play'}
            initial={{ opacity: 0, scale: 0.6, filter: 'blur(2px)' }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, scale: 0.6, filter: 'blur(2px)' }}
            transition={{ duration: 0.2, ease: ease.out }}
          >
            {playing ? <Pause className="size-4" strokeWidth={1.75} /> : <Play className="size-4 translate-x-px" strokeWidth={1.75} />}
          </motion.span>
        </AnimatePresence>
      </button>
      <button onClick={onRestart} aria-label="Baştan oynat" className={btn}>
        <RotateCcw className="size-4" strokeWidth={1.75} />
      </button>
      <div className="h-px flex-1 bg-graphite-900/10" aria-hidden>
        <div ref={progressRef} className="h-px origin-left bg-graphite-900/70" />
      </div>
    </div>
  )
})
