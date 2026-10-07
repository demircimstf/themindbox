import { useEffect, useState } from 'react'
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'motion/react'
import { cn } from '@/lib/cn'
import { ease } from '@/lib/motion'
import { site } from '@/data/site'
import { useEscape, useLockBody } from '@/lib/hooks'
import { Logo } from '@/components/ui/Logo'
import { Button } from '@/components/ui/Button'

export function Navbar() {
  const { scrollY } = useScroll()
  const [scrolled, setScrolled] = useState(false)
  const [hidden, setHidden] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  // Aşağı kaydırınca çekil, yukarı kaydırınca geri gel
  // Motion kaydırmayı zaten rAF ile toplar (kare başına en fazla bir çağrı);
  // ek olarak state'i yalnızca değer gerçekten değiştiğinde yazıyoruz.
  useMotionValueEvent(scrollY, 'change', (y) => {
    const prev = scrollY.getPrevious() ?? 0
    const nextScrolled = y > 24
    const nextHidden = y > prev && y > 400 && !menuOpen
    if (nextScrolled !== scrolled) setScrolled(nextScrolled)
    if (nextHidden !== hidden) setHidden(nextHidden)
  })

  useLockBody(menuOpen)
  useEscape(menuOpen, () => setMenuOpen(false))

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)')
    const close = () => mq.matches && setMenuOpen(false)
    mq.addEventListener('change', close)
    return () => mq.removeEventListener('change', close)
  }, [])

  return (
    <>
      <motion.header
        className="fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-4 will-change-transform md:pt-5"
        animate={{ y: hidden ? '-120%' : '0%' }}
        transition={{ duration: 0.45, ease: ease.out }}
      >
        <nav
          aria-label="Ana menü"
          className={cn(
            'flex h-14 w-full max-w-6xl items-center justify-between rounded-full pl-5 pr-2',
            'border transition-[background-color,border-color,box-shadow,backdrop-filter] duration-500 ease-out-strong',
            scrolled
              ? 'border-graphite-900/10 bg-paper-100/70 shadow-[0_10px_40px_-12px_rgba(60,45,30,0.10)] backdrop-blur-xl'
              : 'border-transparent bg-transparent',
          )}
        >
          <Logo />

          <ul className="hidden items-center gap-1 md:flex">
            {site.nav.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  className="relative rounded-full px-4 py-2 text-[13.5px] text-graphite-700 transition-colors duration-200 hover:text-graphite-950"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-2">
            <Button href="#urunler" size="sm" icon className="hidden sm:inline-flex">
              Keşfet
            </Button>
            <MenuToggle open={menuOpen} onToggle={() => setMenuOpen((v) => !v)} />
          </div>
        </nav>
      </motion.header>

      <MobileMenu open={menuOpen} onNavigate={() => setMenuOpen(false)} />
    </>
  )
}

function MenuToggle({ open, onToggle }: { open: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      aria-label={open ? 'Menüyü kapat' : 'Menüyü aç'}
      aria-expanded={open}
      className="relative z-[60] grid size-10 place-items-center rounded-full text-graphite-900 transition-transform duration-200 ease-out-strong active:scale-[0.94] md:hidden"
    >
      <span className="relative block h-3 w-5">
        <span
          className={cn(
            'absolute left-0 h-px w-full bg-current transition-transform duration-300 ease-out-strong',
            open ? 'top-1/2 rotate-45' : 'top-0',
          )}
        />
        <span
          className={cn(
            'absolute left-0 h-px w-full bg-current transition-transform duration-300 ease-out-strong',
            open ? 'top-1/2 -rotate-45' : 'top-full',
          )}
        />
      </span>
    </button>
  )
}

function MobileMenu({ open, onNavigate }: { open: boolean; onNavigate: () => void }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-40 flex flex-col justify-between bg-paper-50/95 px-6 pb-10 pt-28 backdrop-blur-2xl md:hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.2 } }}
          transition={{ duration: 0.3, ease: ease.out }}
        >
          <motion.ul
            className="flex flex-col"
            initial="hidden"
            animate="visible"
            transition={{ staggerChildren: 0.05, delayChildren: 0.05 }}
          >
            {site.nav.map((item, i) => (
              <motion.li
                key={item.href}
                className="overflow-hidden border-b border-graphite-900/10"
                variants={{ hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0 } }}
                transition={{ duration: 0.6, ease: ease.out }}
              >
                <a
                  href={item.href}
                  onClick={onNavigate}
                  className="flex items-baseline justify-between py-5 display text-[40px] leading-none text-graphite-950 active:opacity-60"
                >
                  {item.label}
                  <span className="label">0{i + 1}</span>
                </a>
              </motion.li>
            ))}
          </motion.ul>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: ease.out, delay: 0.25 }}
            className="space-y-6"
          >
            <Button href="#urunler" onClick={onNavigate} size="lg" icon className="w-full">
              Koleksiyonu keşfet
            </Button>
            <p className="label text-center">{site.email}</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
