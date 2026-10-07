import { useLayoutEffect, useRef, useState } from 'react'
import { motion, useInView, useReducedMotion, useScroll, useSpring, useTransform } from 'motion/react'
import { gallery, type GalleryItem } from '@/data/gallery'
import { cn } from '@/lib/cn'
import { useMediaQuery } from '@/lib/hooks'
import { SectionLabel } from '@/components/ui/SectionLabel'
import { SplitWords } from '@/components/ui/Reveal'
import { ArtFrame } from '@/components/visual/ProductArt'

const TONES: Record<GalleryItem['tone'], string> = {
  oak: 'radial-gradient(90% 70% at 30% 90%, rgba(196,154,108,.45), transparent 70%), linear-gradient(160deg, #f3ede3, #e6dccb)',
  linen: 'radial-gradient(70% 60% at 70% 20%, rgba(255,255,255,.9), transparent 70%), linear-gradient(200deg, #f4f1eb, #e4ded3)',
  stone: 'radial-gradient(80% 70% at 50% 100%, rgba(140,133,122,.25), transparent 70%), linear-gradient(180deg, #eeebe5, #dcd7ce)',
  walnut: 'radial-gradient(80% 70% at 25% 80%, rgba(120,80,48,.30), transparent 70%), linear-gradient(150deg, #efe7dc, #d9cbb7)',
}

/** Tüm karolar aynı ölçüde: eşit genişlik, eşit oran (4:5) */
const TILE = 'w-[78vw] sm:w-[46vw] md:w-[30vw] lg:w-[26vw]'

export function Gallery() {
  const ref = useRef<HTMLElement>(null)
  const track = useRef<HTMLUListElement>(null)
  const reduce = useReducedMotion()
  const isDesktop = useMediaQuery('(min-width: 768px)')
  const [distance, setDistance] = useState(0)
  const horizontal = isDesktop && !reduce

  useLayoutEffect(() => {
    const el = track.current
    if (!el) return
    const measure = () => {
      // Son karonun sağ kenarı ile parkurun sağ kenarı arasındaki fark (transform'dan bağımsız)
      const last = el.lastElementChild?.getBoundingClientRect().right ?? 0
      setDistance(Math.max(0, last - el.getBoundingClientRect().right + 48))
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [horizontal])

  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  // Dikey kaydırma → yatay hareket. Yay, tekerlek adımlarını pürüzsüzleştirir.
  const x = useSpring(useTransform(scrollYProgress, [0.05, 0.95], [0, -distance]), { stiffness: 140, damping: 30, mass: 0.4 })

  return (
    <section id="deneyim" ref={ref} className={cn('relative', horizontal && 'h-[300vh]')}>
      <div className={cn('flex flex-col justify-center overflow-hidden py-28', horizontal && 'sticky top-0 h-screen py-0')}>
        <div className="mx-auto mb-12 flex w-full max-w-7xl items-end justify-between gap-8 px-5 sm:px-8 md:mb-16">
          <div>
            <SectionLabel index="04" className="mb-8">
              Deneyim
            </SectionLabel>
            <h2 className="display text-[clamp(2.25rem,5vw,4.5rem)] leading-[0.98] text-graphite-950">
              <SplitWords text="Zamanın yavaşladığı" className="block" />
              <SplitWords text="anlar." delay={0.1} className="text-graphite-400" />
            </h2>
          </div>
          <ProgressRail progress={scrollYProgress} />
        </div>

        <motion.ul
          ref={track}
          style={horizontal ? { x } : undefined}
          className={cn(
            'flex items-start gap-5 px-5 [scrollbar-width:none] sm:px-8 md:gap-8 md:pl-[max(2rem,calc((100vw-80rem)/2+2rem))]',
            // Hareket kapalıyken (mobil / azaltılmış hareket) doğal yatay kaydırmaya düş
            horizontal ? 'will-change-transform' : 'snap-x snap-mandatory overflow-x-auto',
          )}
        >
          {gallery.map((item, i) => (
            <Tile key={item.id} item={item} index={i} />
          ))}
        </motion.ul>
      </div>
    </section>
  )
}

function Tile({ item, index }: { item: GalleryItem; index: number }) {
  // Karo görünür alana girince parçalar birleşir, çıkınca yeniden dağılır
  const ref = useRef<HTMLLIElement>(null)
  const inView = useInView(ref, { amount: 0.7 })
  return (
    <li ref={ref} className={cn('group shrink-0 snap-center', TILE)}>
      <figure className="flex h-full flex-col">
        <div className="relative aspect-[4/5] overflow-hidden rounded-[20px] bg-paper-150">
          {item.image ? (
            <img
              src={item.image}
              alt={item.caption}
              loading="lazy"
              className="absolute inset-0 size-full object-cover transition-transform duration-[1.2s] ease-out-strong group-hover:scale-[1.04]"
            />
          ) : (
            <div
              className="absolute inset-0 transition-transform duration-[1.2s] ease-out-strong group-hover:scale-[1.04]"
              style={{ background: TONES[item.tone] }}
            >
              <ArtFrame kind={item.art} active={inView} />
            </div>
          )}
          <span className="label absolute left-5 top-5 text-graphite-700">{String(index + 1).padStart(2, '0')}</span>
        </div>
        <figcaption className="mt-4 flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
          <span className="text-lg font-medium tracking-[-0.02em] text-graphite-900">{item.caption}</span>
          <span className="label shrink-0">{item.meta}</span>
        </figcaption>
      </figure>
    </li>
  )
}

function ProgressRail({ progress }: { progress: ReturnType<typeof useScroll>['scrollYProgress'] }) {
  const scaleX = useTransform(progress, [0, 1], [0, 1])
  return (
    <div className="hidden w-40 md:block" aria-hidden>
      <div className="h-px w-full bg-graphite-900/10">
        <motion.div className="h-px origin-left bg-graphite-900" style={{ scaleX }} />
      </div>
    </div>
  )
}
