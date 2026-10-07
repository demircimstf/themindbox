import { useEffect, useRef, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'motion/react'
import { X } from 'lucide-react'
import { ease, spring } from '@/lib/motion'
import { useEscape, useLockBody, useMediaQuery } from '@/lib/hooks'

interface ModalProps {
  open: boolean
  onClose: () => void
  label: string
  children: ReactNode
  /** md: uzun metinler için daha dar, okunaklı bir sütun */
  size?: 'md' | 'lg'
}

/**
 * Masaüstünde: 0.96 ölçekten yayla oturan merkez panel (asla scale(0)'dan değil).
 * Mobilde: alttan, iOS çekmece eğrisiyle kayan sayfa.
 */
export function Modal({ open, onClose, label, children, size = 'lg' }: ModalProps) {
  const isDesktop = useMediaQuery('(min-width: 768px)')
  const closeRef = useRef<HTMLButtonElement>(null)
  const returnFocus = useRef<HTMLElement | null>(null)

  useLockBody(open)
  useEscape(open, onClose)

  useEffect(() => {
    if (open) {
      returnFocus.current = document.activeElement as HTMLElement
      requestAnimationFrame(() => closeRef.current?.focus({ preventScroll: true }))
    } else {
      returnFocus.current?.focus({ preventScroll: true })
    }
  }, [open])

  const panel = isDesktop
    ? {
        initial: { opacity: 0, scale: 0.96, y: 8 },
        animate: { opacity: 1, scale: 1, y: 0, transition: spring.soft },
        exit: { opacity: 0, scale: 0.98, transition: { duration: 0.18, ease: ease.out } },
      }
    : {
        initial: { y: '100%' },
        animate: { y: 0, transition: { duration: 0.5, ease: ease.drawer } },
        exit: { y: '100%', transition: { duration: 0.28, ease: ease.drawer } },
      }

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center md:items-center md:p-8">
          <motion.div
            className="absolute inset-0 bg-graphite-900/25 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: 0.3, ease: ease.out } }}
            exit={{ opacity: 0, transition: { duration: 0.2, ease: ease.out } }}
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={label}
            className={`relative max-h-[92dvh] w-full overflow-y-auto rounded-t-[28px] border border-graphite-900/10 bg-paper-100 shadow-[0_40px_120px_-20px_rgba(60,45,30,0.28)] md:rounded-[28px] ${size === 'md' ? 'md:max-w-2xl' : 'md:max-w-4xl'}`}
            {...panel}
          >
            <button
              ref={closeRef}
              onClick={onClose}
              aria-label="Kapat"
              className="absolute right-4 top-4 z-10 grid size-10 place-items-center rounded-full bg-paper-200/80 text-graphite-700 backdrop-blur transition-[transform,color,background-color] duration-200 ease-out-strong hover:bg-paper-300 hover:text-graphite-950 active:scale-[0.94]"
            >
              <X className="size-4" strokeWidth={1.75} />
            </button>
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
