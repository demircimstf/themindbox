import { cn } from '@/lib/cn'

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={cn('size-7', className)} fill="none" aria-hidden>
      <path d="M8 11.5 16 7l8 4.5v9L16 25l-8-4.5z" stroke="currentColor" strokeWidth={1.3} strokeLinejoin="round" />
      <path d="M8 11.5 16 16l8-4.5M16 16v9" stroke="currentColor" strokeWidth={1.3} strokeLinejoin="round" opacity={0.55} />
      <circle cx={25.5} cy={8.5} r={2} fill="var(--color-acrylic)" />
    </svg>
  )
}

export function Logo({ className }: { className?: string }) {
  return (
    <a href="#top" className={cn('group flex items-center gap-2.5 text-graphite-950', className)} aria-label="The Mind Box — ana sayfa">
      <LogoMark className="transition-transform duration-500 ease-out-strong group-hover:rotate-[-8deg]" />
      <span className="display text-[19px] leading-none tracking-[-0.035em]">
        The <span className="font-light text-graphite-500">Mind</span> Box
      </span>
    </a>
  )
}
