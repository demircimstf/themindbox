import { useRef } from 'react'
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react'
import { ArrowDown } from 'lucide-react'
import { ease } from '@/lib/motion'
import { site } from '@/data/site'
import { Button } from '@/components/ui/Button'
import { SplitWords } from '@/components/ui/Reveal'
import { HeroPuzzle } from '@/components/visual/HeroPuzzle'

export function Hero() {
  const ref = useRef<HTMLElement>(null)
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })

  // Kaydırdıkça kutu açılır, metin geri çekilir — sahne bir sonraki bölüme devredilir
  const textY = useTransform(scrollYProgress, [0, 1], ['0%', reduce ? '0%' : '-18%'])
  const fade = useTransform(scrollYProgress, [0, 0.65], [1, 0])
  const artScale = useTransform(scrollYProgress, [0, 1], [1, reduce ? 1 : 1.25])

  return (
    <section
      id="top"
      ref={ref}
      className="grain relative isolate flex min-h-[100svh] flex-col overflow-hidden"
    >
      {/* Derinlik: cubenin arkasında soğuk bir hale ve kaybolan perspektif ızgarası */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-[38%] size-[70vmax] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(255,253,249,0.95),transparent)] lg:left-[68%]" />
        <div className="absolute left-1/2 top-[40%] size-[22vmax] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(196,154,108,0.22),transparent)] blur-2xl lg:left-[68%]" />
        <div
          className="absolute inset-x-0 bottom-0 h-[55%] opacity-60 [mask-image:linear-gradient(to_top,black,transparent)]"
          style={{
            backgroundImage:
              'linear-gradient(to right, rgba(35,33,30,.07) 1px, transparent 1px), linear-gradient(to bottom, rgba(35,33,30,.07) 1px, transparent 1px)',
            backgroundSize: '72px 72px',
            transform: 'perspective(600px) rotateX(58deg)',
            transformOrigin: 'bottom',
          }}
        />
      </div>

      <div className="mx-auto grid w-full max-w-7xl flex-1 grid-cols-1 items-end gap-10 px-5 pb-10 pt-28 sm:px-8 lg:grid-cols-12 lg:pb-16 lg:pt-32">
        <motion.div
          style={{ scale: artScale, opacity: fade }}
          className="order-1 flex will-change-[transform,opacity] items-center justify-center lg:order-2 lg:col-span-5 lg:h-full"
        >
          <motion.div
            className="w-[min(40svh,84vw)] lg:w-full lg:max-w-[480px]"
            initial={reduce ? false : { opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, ease: ease.out, delay: 0.2 }}
          >
            <HeroPuzzle />
          </motion.div>
        </motion.div>

        <motion.div style={{ y: textY, opacity: fade }} className="will-change-[transform,opacity] order-2 lg:order-1 lg:col-span-7">
          <motion.p
            className="label mb-8 flex items-center gap-3"
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.1 }}
          >
            <span className="size-1.5 rounded-full bg-acrylic" />
            Brain Fitness bulmacaları — {site.city}
          </motion.p>

          <h1 className="display text-[clamp(3rem,8.2vw,7.5rem)] leading-[0.95] text-graphite-950">
            <SplitWords text="Zihin, açılmayı" animateOnMount delay={0.25} className="block" />
            <span className="block">
              <SplitWords text="bekleyen bir" animateOnMount delay={0.4} />{' '}
              <SplitWords text="kutudur." animateOnMount delay={0.55} className="text-graphite-400" />
            </span>
          </h1>

          <motion.div
            className="mt-10 flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between lg:mt-14"
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: ease.out, delay: 0.9 }}
          >
            <p className="max-w-sm text-[15px] leading-relaxed text-graphite-500">
              Kutuyu aç, akrilik parçaları masaya dök, kapaktaki şekli tamamla. Basit kural, zorlu zihin egzersizi.
            </p>
            <div className="flex items-center gap-3">
              <Button href="#urunler" size="lg" icon>
                Koleksiyonu keşfet
              </Button>
              <Button href="#nasil-calisir" size="lg" variant="ghost" className="hidden md:inline-flex">
                Nasıl çalışır?
              </Button>
            </div>
          </motion.div>
        </motion.div>
      </div>

      <motion.div
        style={{ opacity: fade }}
        className="mx-auto flex w-full max-w-7xl items-center justify-between border-t border-graphite-900/10 px-5 py-5 sm:px-8"
      >
        <a href="#nasil-calisir" className="label group flex items-center gap-3 transition-colors hover:text-graphite-900">
          <span className="relative grid size-8 place-items-center overflow-hidden rounded-full border border-graphite-900/15">
            <ArrowDown className="size-3.5 animate-[drift_2.4s_var(--ease-in-out-strong)_infinite]" strokeWidth={1.5} />
          </span>
          Aşağı kaydır
        </a>
        <span className="label hidden sm:block">Est. 2026</span>
        <span className="label">{site.domain}</span>
      </motion.div>
    </section>
  )
}
