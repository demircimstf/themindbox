import { useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Plus } from 'lucide-react'
import { products, type Product } from '@/data/products'
import { cn } from '@/lib/cn'
import { ease, spring } from '@/lib/motion'
import { SectionLabel } from '@/components/ui/SectionLabel'
import { Reveal, SplitWords } from '@/components/ui/Reveal'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { ArtFrame } from '@/components/visual/ProductArt'
import { inquire } from '@/lib/inquire'
import { useMediaQuery } from '@/lib/hooks'

export function Showcase() {
  const [activeId, setActiveId] = useState(products[0].id)
  const [openId, setOpenId] = useState<string | null>(null)
  const active = products.find((p) => p.id === activeId)!
  const opened = products.find((p) => p.id === openId) ?? null
  // Yalnızca görünen düzen çizilir: gizli (display:none) liste de animasyon çalıştırmasın
  const isDesktop = useMediaQuery('(min-width: 1024px)')

  return (
    <section id="urunler" className="relative py-32 md:py-44">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <header className="mb-16 flex flex-col gap-10 md:mb-24 md:flex-row md:items-end md:justify-between">
          <div>
            <SectionLabel index="03" className="mb-8">
              Koleksiyon
            </SectionLabel>
            <h2 className="display text-[clamp(2.5rem,6vw,5.5rem)] leading-[0.98] text-graphite-950">
              <SplitWords text="Elde tutulan" className="block" />
              <SplitWords text="sessiz bilmeceler." delay={0.12} className="block text-graphite-400" />
            </h2>
          </div>
          <Reveal className="max-w-xs text-[15px] leading-relaxed text-graphite-500">
            Lazer kesim akrilik parçalar, kapakta tek bir hedef şekil. Satıştan önce, tanışmak için buradalar.
          </Reveal>
        </header>

        {/* Masaüstü: liste + yapışkan sahne */}
        {isDesktop ? (
          <div className="grid grid-cols-12 gap-10">
            <ul className="col-span-5 flex flex-col">
              {products.map((p) => (
                <ProductRow
                  key={p.id}
                  product={p}
                  active={p.id === activeId}
                  onActivate={() => setActiveId(p.id)}
                  onOpen={() => setOpenId(p.id)}
                />
              ))}
            </ul>

            <div className="col-span-7">
              <div className="sticky top-28">
                <Stage product={active} onOpen={() => setOpenId(active.id)} />
              </div>
            </div>
          </div>

        ) : (
          /* Mobil: yatay kaydırmalı kartlar */
          <ul className="-mx-5 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-4 [scrollbar-width:none] sm:-mx-8 sm:px-8">
            {products.map((p) => (
              <li key={p.id} className="w-[82%] shrink-0 snap-center sm:w-[60%]">
                <button
                  onClick={() => setOpenId(p.id)}
                  className="block w-full text-left transition-transform duration-200 ease-out-strong active:scale-[0.98]"
                >
                  <div className="relative aspect-[4/5] overflow-hidden rounded-[24px] border border-graphite-900/10 bg-gradient-to-b from-paper-150 to-paper-100">
                    <ArtFrame kind={p.art} active className="pb-[18%]" />
                    <span className="label absolute left-5 top-5">{p.index}</span>
                    <span className="absolute bottom-5 right-5 grid size-10 place-items-center rounded-full bg-graphite-900 text-paper-50">
                      <Plus className="size-4" strokeWidth={1.75} />
                    </span>
                  </div>
                  <div className="mt-4 flex flex-col gap-1.5">
                    <h3 className="display truncate text-2xl text-graphite-950">{p.name}</h3>
                    <span className="label">{p.kicker}</span>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <Modal open={!!opened} onClose={() => setOpenId(null)} label={opened?.name ?? 'Ürün'}>
        {opened && <ProductDetail product={opened} onInquire={() => { setOpenId(null); inquire(opened.name) }} />}
      </Modal>
    </section>
  )
}

function ProductRow({
  product,
  active,
  onActivate,
  onOpen,
}: {
  product: Product
  active: boolean
  onActivate: () => void
  onOpen: () => void
}) {
  return (
    <li className="relative border-t border-graphite-900/10 last:border-b">
      {active && (
        <motion.span
          layoutId="row-indicator"
          className="absolute inset-y-0 -left-5 w-px bg-acrylic"
          transition={spring.snappy}
        />
      )}
      <button
        onPointerEnter={onActivate}
        onFocus={onActivate}
        onClick={onOpen}
        className="group flex w-full items-center gap-6 py-8 text-left"
      >
        <span className={cn('label w-6 transition-colors duration-300', active && 'text-acrylic')}>{product.index}</span>
        <span className="flex-1">
          <span
            className={cn(
              'display block text-[40px] leading-none transition-[color,transform] duration-500 ease-out-strong',
              active ? 'translate-x-2 text-graphite-950' : 'text-graphite-400 group-hover:text-graphite-700',
            )}
          >
            {product.name}
          </span>
          <span className={cn('label mt-3 block transition-opacity duration-300', active ? 'opacity-100' : 'opacity-0')}>
            {product.series} · {product.kicker}
          </span>
        </span>
        <Difficulty level={product.difficulty} dim={!active} />
      </button>
    </li>
  )
}

function Stage({ product, onOpen }: { product: Product; onOpen: () => void }) {
  // İmleci takip eden yumuşak spot ışığı (CSS değişkeni; React render'ı tetiklemez).
  // pointermove saniyede 120+ kez gelebilir — rAF ile kare başına tek yazıma indirilir.
  const frame = useRef(0)
  const onMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const el = e.currentTarget
    const { clientX, clientY } = e
    if (frame.current) return
    frame.current = requestAnimationFrame(() => {
      frame.current = 0
      const r = el.getBoundingClientRect()
      el.style.setProperty('--mx', `${clientX - r.left}px`)
      el.style.setProperty('--my', `${clientY - r.top}px`)
    })
  }

  return (
    <div
      onPointerMove={onMove}
      className="group relative aspect-[5/4] overflow-hidden rounded-[32px] border border-graphite-900/10 bg-gradient-to-br from-paper-150 via-paper-100 to-paper-50 [--mx:50%] [--my:50%]"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{ background: 'radial-gradient(420px circle at var(--mx) var(--my), rgba(255,255,255,.75), transparent 60%)' }}
      />

      <AnimatePresence mode="popLayout" initial={false}>
        <motion.div
          key={product.id}
          className="absolute inset-0"
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.02 }}
          transition={{ duration: 0.55, ease: ease.out }}
        >
          <ArtFrame kind={product.art} active className="px-[12%] pb-[17%] pt-[7%]" />
          <div className="absolute inset-x-8 top-8 flex items-start justify-between">
            <span className="label">Ref. {product.index} / 0{products.length}</span>
            <span className="label text-right">{product.specs[0].value}</span>
          </div>
          <div className="absolute inset-x-8 bottom-8 flex items-end justify-between gap-6">
            <div>
              <p className="display max-w-sm text-3xl text-graphite-950">{product.tagline}</p>
            </div>
            <Button onClick={onOpen} variant="ghost" size="md" icon className="bg-paper-50/40 backdrop-blur">
              İncele
            </Button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

function ProductDetail({ product, onInquire }: { product: Product; onInquire: () => void }) {
  return (
    <div className="grid md:grid-cols-2">
      <div className="relative aspect-square bg-gradient-to-br from-paper-150 to-paper-50 md:aspect-auto">
        <ArtFrame kind={product.art} active />
        <span className="label absolute left-6 top-6">Ref. {product.index}</span>
      </div>
      <div className="flex flex-col p-7 md:p-10">
        <span className="label mb-4">{product.series} · {product.kicker}</span>
        <h3 className="display text-5xl text-graphite-950">{product.name}</h3>
        <p className="mt-3 text-lg text-graphite-500">{product.tagline}</p>
        <p className="mt-6 text-[15px] leading-relaxed text-graphite-500">{product.description}</p>

        <dl className="mt-8 divide-y divide-graphite-900/10 border-y border-graphite-900/10">
          {product.specs.map((s) => (
            <div key={s.label} className="flex items-center justify-between py-3.5 text-sm">
              <dt className="text-graphite-500">{s.label}</dt>
              <dd className="text-graphite-900">{s.value}</dd>
            </div>
          ))}
          <div className="flex items-center justify-between py-3.5 text-sm">
            <dt className="text-graphite-500">Zorluk</dt>
            <dd>
              <Difficulty level={product.difficulty} />
            </dd>
          </div>
        </dl>

        <div className="mt-auto flex gap-3 pt-10">
          <Button onClick={onInquire} size="lg" icon className="flex-1">
            Bilgi al
          </Button>
        </div>
      </div>
    </div>
  )
}

function Difficulty({ level, dim = false }: { level: number; dim?: boolean }) {
  return (
    <span className="flex items-end gap-[3px]" aria-label={`Zorluk ${level}/5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <span
          key={n}
          className={cn(
            'w-[3px] rounded-full transition-colors duration-500',
            n <= level ? (dim ? 'bg-graphite-400' : 'bg-graphite-900') : 'bg-graphite-900/10',
          )}
          style={{ height: 6 + n * 3 }}
        />
      ))}
    </span>
  )
}
