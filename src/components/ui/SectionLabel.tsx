import { cn } from '@/lib/cn'

/** "(02) — Felsefe" biçiminde editoryal bölüm etiketi */
export function SectionLabel({ index, children, className }: { index: string; children: string; className?: string }) {
  return (
    <div className={cn('label flex items-center gap-3', className)}>
      <span className="text-graphite-700">({index})</span>
      <span className="h-px w-8 bg-graphite-900/20" aria-hidden />
      <span>{children}</span>
    </div>
  )
}
