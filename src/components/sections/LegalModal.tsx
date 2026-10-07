import { useCallback, useEffect, useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { LEGAL_UPDATED, legalDocs, type LegalBlock, type LegalId } from '@/data/legal'

const isLegalId = (v: string): v is LegalId => v in legalDocs
const fromHash = (): LegalId | null => {
  const id = decodeURIComponent(window.location.hash.slice(1))
  return isLegalId(id) ? id : null
}

/**
 * KVKK Aydınlatma Metni ve Çerez Politikası. Adrese bağlıdır: `/#kvkk` ve
 * `/#cerez-politikasi` doğrudan paylaşılabilir; sayfadaki bağlantılar yalnızca hash değiştirir.
 */
export function LegalModal() {
  const [id, setId] = useState<LegalId | null>(null)

  useEffect(() => {
    const sync = () => setId(fromHash())
    sync()
    window.addEventListener('hashchange', sync)
    return () => window.removeEventListener('hashchange', sync)
  }, [])

  // Kapatınca adresten hash'i kaldır — sayfa kaymasın, geri tuşu modalı yeniden açmasın
  const close = useCallback(() => {
    setId(null)
    history.replaceState(null, '', window.location.pathname + window.location.search)
  }, [])

  const doc = id ? legalDocs[id] : null
  const other = id === 'kvkk' ? legalDocs['cerez-politikasi'] : legalDocs.kvkk

  return (
    <Modal open={!!doc} onClose={close} label={doc?.title ?? 'Yasal metin'} size="md">
      {doc && (
        <article className="px-6 pb-10 pt-12 sm:px-10">
          <p className="label mb-4">{doc.kicker}</p>
          <h2 className="display text-4xl text-graphite-950 sm:text-5xl">{doc.title}</h2>
          <p className="mt-3 text-xs text-graphite-400">Son güncelleme: {LEGAL_UPDATED}</p>
          <p className="mt-8 text-[15px] leading-relaxed text-graphite-700">{doc.intro}</p>

          <div className="mt-10 space-y-9">
            {doc.sections.map((section) => (
              <section key={section.heading}>
                <h3 className="text-[15px] font-semibold tracking-[-0.01em] text-graphite-950">{section.heading}</h3>
                <div className="mt-3 space-y-3 text-[14.5px] leading-relaxed text-graphite-500">
                  {section.blocks.map((block, i) => (
                    <Block key={i} block={block} />
                  ))}
                </div>
              </section>
            ))}
          </div>

          <div className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-graphite-900/10 pt-6">
            <a
              href={`#${other.id}`}
              className="text-sm text-graphite-700 underline decoration-graphite-900/20 underline-offset-4 transition-colors hover:text-graphite-950 hover:decoration-graphite-900/60"
            >
              {other.title} →
            </a>
            <button
              onClick={close}
              className="h-10 rounded-full bg-graphite-900 px-5 text-sm font-medium text-paper-50 transition-[transform,background-color] duration-200 ease-out-strong hover:bg-graphite-950 active:scale-[0.97]"
            >
              Okudum, kapat
            </button>
          </div>
        </article>
      )}
    </Modal>
  )
}

function Block({ block }: { block: LegalBlock }) {
  if (typeof block === 'string') return <p>{block}</p>
  return (
    <ul className="space-y-2">
      {block.list.map((item) => (
        <li key={item} className="flex gap-3">
          <span aria-hidden className="mt-[0.6em] size-1 shrink-0 rounded-full bg-acrylic" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  )
}
