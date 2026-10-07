import { useRef } from 'react'
import { motion, useScroll, useTransform, type MotionValue } from 'motion/react'
import { SectionLabel } from '@/components/ui/SectionLabel'
import { Reveal } from '@/components/ui/Reveal'

const MANIFESTO =
  'Biz bir kutu üretmiyoruz. Bir eşik üretiyoruz: ekranların sustuğu, ellerin düşündüğü, zihnin yeniden yavaşladığı o an. Her parça; sabrın, merakın ve kutunun dışına çıkma cesaretinin somut hâlidir.'

const PRINCIPLES = [
  {
    no: 'I',
    title: 'Odak',
    body: 'Bildirimsiz, ekransız, sessiz bir zaman dilimi. Dikkatin dağılmadığı tek yer: ellerinin arası.',
  },
  {
    no: 'II',
    title: 'Sabır',
    body: 'Hiçbir çözüm aceleye gelmez. Her parça, doğru anı beklemeyi yeniden öğretir.',
  },
  {
    no: 'III',
    title: 'Merak',
    body: '"Ya böyle olursa?" sorusu. Kutunun dışındaki her fikir, bu soruyla başlar.',
  },
]

export function Philosophy() {
  return (
    <section id="felsefe" className="relative overflow-hidden pb-16 pt-32 md:pb-24 md:pt-48">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-3">
            <SectionLabel index="02" className="lg:sticky lg:top-32">
              Felsefe
            </SectionLabel>
          </div>
          <div className="lg:col-span-9">
            <ScrollManifesto text={MANIFESTO} />
          </div>
        </div>

        <ol className="mt-28 grid gap-x-10 gap-y-16 md:mt-40 md:grid-cols-3">
          {PRINCIPLES.map((p, i) => (
            <Reveal
              as="li"
              key={p.no}
              delay={i * 0.08}
              // Merdiven ritmi: sıradan eşit kolonlar yerine kademeli bir okuma
              className={i === 1 ? 'md:mt-24' : i === 2 ? 'md:mt-48' : ''}
            >
              <div className="group border-t border-graphite-900/10 pt-6">
                <div className="mb-10 flex items-baseline justify-between">
                  <span className="font-mono text-xs text-graphite-400 transition-colors duration-500 group-hover:text-acrylic">
                    {p.no}
                  </span>
                  <span className="h-px w-0 bg-acrylic transition-[width] duration-700 ease-out-strong group-hover:w-16" />
                </div>
                <h3 className="display text-4xl text-graphite-950 md:text-5xl">{p.title}</h3>
                <p className="mt-5 max-w-xs text-[15px] leading-relaxed text-graphite-500">{p.body}</p>
              </div>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  )
}

/** Okudukça aydınlanan manifesto: her kelime kaydırma ilerlemesine bağlı olarak belirginleşir. */
function ScrollManifesto({ text }: { text: string }) {
  const ref = useRef<HTMLParagraphElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 0.85', 'end 0.45'] })
  const words = text.split(' ')

  return (
    <p
      ref={ref}
      className="display font-normal text-[clamp(1.75rem,3.8vw,3.5rem)] leading-[1.14] tracking-[-0.035em] text-graphite-950"
      aria-label={text}
    >
      {words.map((word, i) => (
        <Word key={i} progress={scrollYProgress} range={[i / words.length, (i + 1) / words.length]}>
          {word}
        </Word>
      ))}
    </p>
  )
}

function Word({ children, progress, range }: { children: string; progress: MotionValue<number>; range: [number, number] }) {
  const opacity = useTransform(progress, range, [0.14, 1])
  const accent = children.startsWith('kutunun') || children.startsWith('dışına')
  return (
    <motion.span aria-hidden style={{ opacity }} className={accent ? 'text-acrylic' : undefined}>
      {children}{' '}
    </motion.span>
  )
}
