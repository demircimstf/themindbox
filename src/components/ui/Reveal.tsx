import type { ReactNode } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { ease, reveal } from '@/lib/motion'

interface RevealProps {
  children: ReactNode
  delay?: number
  className?: string
  as?: 'div' | 'li' | 'p' | 'h2' | 'span'
}

/** Görünüme girince bir kez, bulanıklıktan netliğe yükselir. */
export function Reveal({ children, delay = 0, className, as = 'div' }: RevealProps) {
  const reduce = useReducedMotion()
  const Tag = motion[as]
  return (
    <Tag
      className={className}
      variants={reveal}
      initial={reduce ? false : 'hidden'}
      whileInView="visible"
      viewport={{ once: true, margin: '0px 0px -12% 0px' }}
      transition={{ duration: 0.9, ease: ease.out, delay }}
    >
      {children}
    </Tag>
  )
}

/** Başlıkları kelime kelime açar. Her kelime kendi maskesinin içinden yükselir. */
export function SplitWords({
  text,
  className,
  delay = 0,
  stagger = 0.06,
  animateOnMount = false,
}: {
  text: string
  className?: string
  delay?: number
  stagger?: number
  animateOnMount?: boolean
}) {
  const reduce = useReducedMotion()
  const words = text.split(' ')
  const trigger = animateOnMount ? { animate: 'visible' } : { whileInView: 'visible', viewport: { once: true } }

  return (
    <motion.span
      className={className}
      initial={reduce ? false : 'hidden'}
      {...trigger}
      transition={{ staggerChildren: stagger, delayChildren: delay }}
      aria-label={text}
    >
      {words.map((word, i) => (
        <span key={i} className="inline-block overflow-hidden pb-[0.12em] -mb-[0.12em] align-bottom" aria-hidden>
          <motion.span
            className="inline-block"
            variants={{ hidden: { y: '105%' }, visible: { y: '0%' } }}
            transition={{ duration: 1, ease: ease.out }}
          >
            {word}
            {i < words.length - 1 && ' '}
          </motion.span>
        </span>
      ))}
    </motion.span>
  )
}
