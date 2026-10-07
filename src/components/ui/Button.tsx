import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react'
import { ArrowUpRight } from 'lucide-react'
import { cn } from '@/lib/cn'

type Variant = 'primary' | 'ghost' | 'quiet'
type Size = 'sm' | 'md' | 'lg'

interface BaseProps {
  variant?: Variant
  size?: Size
  icon?: boolean
  children: ReactNode
  className?: string
}

type AsButton = BaseProps & ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined }
type AsLink = BaseProps & AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }

const base =
  // Basma hissi: scale(0.97), hızlı ve güçlü ease-out. Yalnızca transform & renk animasyonu.
  'group/btn relative inline-flex select-none items-center justify-center gap-2 whitespace-nowrap rounded-full font-medium ' +
  'transition-[transform,background-color,color,border-color] duration-200 ease-out-strong ' +
  'active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50'

const variants: Record<Variant, string> = {
  primary: 'bg-graphite-900 text-paper-50 hover:bg-graphite-950',
  ghost: 'border border-graphite-900/15 text-graphite-900 hover:border-graphite-900/35 hover:bg-graphite-900/[0.04]',
  quiet: 'text-graphite-700 hover:text-graphite-950',
}

const sizes: Record<Size, string> = {
  sm: 'h-9 px-4 text-[13px]',
  md: 'h-11 px-5 text-sm',
  lg: 'h-14 px-7 text-[15px]',
}

function Inner({ children, icon }: { children: ReactNode; icon?: boolean }) {
  return (
    <>
      <span>{children}</span>
      {icon && (
        <span className="relative -mr-1 inline-flex size-4 overflow-hidden" aria-hidden>
          {/* Ok, hover'da çıkıp yerine yenisi gelir — kesintisiz bir döngü hissi */}
          <ArrowUpRight
            className="size-4 transition-transform duration-300 ease-out-strong group-hover/btn:translate-x-4 group-hover/btn:-translate-y-4"
            strokeWidth={1.75}
          />
          <ArrowUpRight
            className="absolute inset-0 size-4 -translate-x-4 translate-y-4 transition-transform duration-300 ease-out-strong group-hover/btn:translate-x-0 group-hover/btn:translate-y-0"
            strokeWidth={1.75}
          />
        </span>
      )}
    </>
  )
}

export function Button(props: AsButton | AsLink) {
  const { variant = 'primary', size = 'md', icon, className, children, ...rest } = props
  const classes = cn(base, variants[variant], sizes[size], className)

  if (rest.href !== undefined) {
    return (
      <a className={classes} {...(rest as AnchorHTMLAttributes<HTMLAnchorElement>)}>
        <Inner icon={icon}>{children}</Inner>
      </a>
    )
  }
  return (
    <button className={classes} {...(rest as ButtonHTMLAttributes<HTMLButtonElement>)}>
      <Inner icon={icon}>{children}</Inner>
    </button>
  )
}
