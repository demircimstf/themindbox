import { memo, useEffect, useState } from 'react'
import type { ProductArt as ArtKind } from '@/data/products'
import { cn } from '@/lib/cn'
import { PuzzleScene } from './PuzzleScene'

/**
 * Ürün illüstrasyonu. Pasifken parçalar merkezde darmadağınık bir yığındır; `active`
 * olduğunda yığın kısa bir an çalkalanır, ardından bütün olarak çözülüp hedef forma
 * tek parça olarak dönüşür. Hiçbir parça yuvasına yürümez — çözüm hiçbir an görünmez.
 */
interface Props {
  kind: ArtKind
  active?: boolean
  className?: string
}

/** Kilitlenmeden önce yığının çalkalandığı süre (ms) */
const CHAOS_LEAD = 900

export const ProductArt = memo(function ProductArt({ kind, active = false, className }: Props) {
  const [formed, setFormed] = useState(false)

  useEffect(() => {
    if (!active) {
      setFormed(false)
      return
    }
    const id = window.setTimeout(() => setFormed(true), CHAOS_LEAD)
    return () => window.clearTimeout(id)
  }, [active, kind])

  // Kartlar ızgarada aynı anda kilitlenebilir: filtresiz (opaklık + ölçek) geçiş kullanılır
  return <PuzzleScene kind={kind} formed={formed} tumble={active} blur={false} className={className} />
})

/**
 * Tüm kartlarda tek tip çerçeve: konteyneri doldurur, çizimi tam ortalar ve
 * her yerde aynı iç boşlukla oranını koruyarak sığdırır.
 */
export const ArtFrame = memo(function ArtFrame({ className, ...props }: Props) {
  return (
    <div className={cn('absolute inset-0 flex items-center justify-center p-[8%]', className)}>
      <ProductArt {...props} className="size-full" />
    </div>
  )
})
