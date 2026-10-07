import { useEffect, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { ease } from '@/lib/motion'
import { SHAPES, SHAPE_ORDER } from './puzzles'
import { PuzzleScene } from './PuzzleScene'

type Phase = 'chaos' | 'formed'

/** Yığının çalkalandığı süre ve formun sahnede kaldığı süre (ms) */
// formed: 1.5 sn birleşme + ~2.6 sn tamamlanmış form
const TIMINGS: Record<Phase, number> = { chaos: 1700, formed: 4100 }

/**
 * Hero sahnesi: parçalar görünmezden belirip merkezde darmadağınık bir yığın olur,
 * kısa bir an çalkalanır ve tek hamlede hedef forma dönüşür. Form bir süre kalır,
 * sahne yumuşakça söner ve sıradaki şekle geçilir. Hiçbir parça bir yere yürümez.
 */
export function HeroPuzzle({ className }: { className?: string }) {
  const reduce = useReducedMotion()
  const [index, setIndex] = useState(0)
  const [phase, setPhase] = useState<Phase>(reduce ? 'formed' : 'chaos')

  useEffect(() => {
    if (reduce) return
    const id = window.setTimeout(() => {
      if (phase === 'chaos') setPhase('formed')
      else {
        setIndex((i) => (i + 1) % SHAPE_ORDER.length)
        setPhase('chaos')
      }
    }, TIMINGS[phase])
    return () => window.clearTimeout(id)
  }, [phase, reduce])

  const def = SHAPES[SHAPE_ORDER[index]]

  return (
    <div className={className}>
      <div className="relative aspect-square w-full [contain:layout_paint] [transform:translateZ(0)]">
        <AnimatePresence mode="wait">
          <motion.div
            key={def.id}
            className="absolute inset-0"
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.97, transition: { duration: 0.5, ease: ease.out } }}
          >
            <PuzzleScene
              kind={def.id}
              formed={phase === 'formed'}
              fit={118}
              spread={32}
              className="size-full overflow-visible"
              label={`${def.name} bulmacası`}
            />
          </motion.div>
        </AnimatePresence>
      </div>
      <div className="mt-2 flex items-center justify-center gap-3" aria-live="polite">
        <span className="label tabular-nums">0{index + 1}</span>
        <span className="h-px w-6 bg-graphite-900/20" />
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={def.id}
            className="label text-graphite-900"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.35, ease: ease.out }}
          >
            IQ Puzzle · {def.name}
          </motion.span>
        </AnimatePresence>
      </div>
    </div>
  )
}
