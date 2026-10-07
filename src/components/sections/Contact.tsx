import { useEffect, useId, useState, type FormEvent, type InputHTMLAttributes, type TextareaHTMLAttributes } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { AlertCircle, ArrowUpRight, Check, Loader2 } from 'lucide-react'
import { site } from '@/data/site'
import { cn } from '@/lib/cn'
import { ease, spring } from '@/lib/motion'
import { SectionLabel } from '@/components/ui/SectionLabel'
import { Reveal, SplitWords } from '@/components/ui/Reveal'
import { INQUIRE_EVENT } from '@/lib/inquire'
import { ContactError, sendContact } from '@/lib/contact'

const TOPICS = ['Ürün bilgisi', 'İş birliği', 'Kurumsal hediye', 'Basın'] as const
type Topic = (typeof TOPICS)[number]
type Status = 'idle' | 'sending' | 'sent' | 'error'

export function Contact() {
  const [topic, setTopic] = useState<Topic>('Ürün bilgisi')
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [error, setError] = useState('')

  // Ürün detayındaki "Bilgi al" → formu o ürünle önceden doldur
  useEffect(() => {
    const onInquire = (e: Event) => {
      const product = (e as CustomEvent<string>).detail
      setTopic('Ürün bilgisi')
      setMessage(`Merhaba, ${product} hakkında bilgi almak istiyorum.`)
      setStatus('idle')
    }
    window.addEventListener(INQUIRE_EVENT, onInquire)
    return () => window.removeEventListener(INQUIRE_EVENT, onInquire)
  }, [])

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (status === 'sending') return
    const form = e.currentTarget
    const data = new FormData(form)
    const field = (k: string) => String(data.get(k) ?? '').trim()
    setStatus('sending')
    setError('')
    try {
      await sendContact({
        name: field('name'),
        email: field('email'),
        company: field('company'),
        topic,
        message: field('message'),
        botcheck: field('botcheck'),
      })
      // Başarılı: alanları sıfırla, teşekkür durumunu bir süre göster
      form.reset()
      setMessage('')
      setTopic('Ürün bilgisi')
      setStatus('sent')
      window.setTimeout(() => setStatus((s) => (s === 'sent' ? 'idle' : s)), 6000)
    } catch (err) {
      setError(err instanceof ContactError ? err.message : 'Mesaj gönderilemedi. Lütfen tekrar deneyin.')
      setStatus('error')
    }
  }

  return (
    <section id="iletisim" className="relative border-t border-graphite-900/10 py-32 md:py-44">
      <div className="mx-auto grid max-w-7xl gap-16 px-5 sm:px-8 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-5">
          <SectionLabel index="05" className="mb-8">
            İletişim
          </SectionLabel>
          <h2 className="display text-[clamp(2.5rem,5.5vw,5rem)] leading-[0.98] text-graphite-950">
            <SplitWords text="Birlikte bir şey" className="block" />
            <SplitWords text="çözelim." delay={0.1} className="text-graphite-400" />
          </h2>
          <Reveal className="mt-8 max-w-sm text-[15px] leading-relaxed text-graphite-500" delay={0.1}>
            Bir ürün hakkında soru, kurumsal bir hediye fikri ya da ortak bir proje — her mesajı bir insan okur ve iki iş
            günü içinde yanıtlar.
          </Reveal>

          <Reveal delay={0.2} className="mt-14 space-y-1">
            <ContactLink href={`mailto:${site.email}`} label="E-posta" value={site.email} />
            <ContactLink href={`tel:${site.phone.replace(/\s/g, '')}`} label="Telefon" value={site.phone} />
            <ContactLink label="Atölye" value={`${site.city}, Türkiye`} />
          </Reveal>
        </div>

        <Reveal delay={0.1} className="lg:col-span-6 lg:col-start-7">
          <form onSubmit={onSubmit} className="relative rounded-[28px] border border-graphite-900/10 bg-paper-100/60 p-6 sm:p-10">
            <fieldset className="mb-10">
              <legend className="label mb-4">Konu</legend>
              <TopicPicker value={topic} onChange={setTopic} />
            </fieldset>

            <div className="grid gap-x-6 sm:grid-cols-2">
              <Field label="Ad Soyad" name="name" autoComplete="name" required />
              <Field label="E-posta" name="email" type="email" autoComplete="email" required />
              <Field label="Kurum (isteğe bağlı)" name="company" autoComplete="organization" className="sm:col-span-2" />
              <Area
                label="Mesajınız"
                name="message"
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="sm:col-span-2"
              />
            </div>
            <input type="hidden" name="topic" value={topic} />
            {/* Bal küpü: ekran okuyuculardan ve klavyeden gizli; botlar doldurur */}
            <input type="checkbox" name="botcheck" className="hidden" tabIndex={-1} autoComplete="off" aria-hidden />

            <div className="mt-10 flex flex-col-reverse items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
              <p className="max-w-[17rem] text-xs leading-relaxed text-graphite-400">
                Kişisel verileriniz yalnızca talebinizi yanıtlamak amacıyla{' '}
                <a href="#kvkk" className="underline decoration-graphite-900/20 underline-offset-2 transition-colors hover:text-graphite-700">
                  KVKK Aydınlatma Metni
                </a>{' '}
                kapsamında işlenir.
              </p>
              <SubmitButton status={status} />
            </div>

            {/* Sonuç bildirimi — ekran okuyucular da duyar */}
            <div aria-live="polite" className="min-h-0">
              <AnimatePresence initial={false}>
                {(status === 'sent' || status === 'error') && (
                  <motion.p
                    key={status}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.35, ease: ease.out }}
                    className="overflow-hidden"
                  >
                    <span
                      className={cn(
                        'mt-6 flex items-start gap-2.5 rounded-2xl px-4 py-3 text-sm leading-relaxed',
                        status === 'sent' ? 'bg-acrylic/10 text-graphite-900' : 'bg-red-600/10 text-red-900',
                      )}
                    >
                      {status === 'sent' ? (
                        <>
                          <Check className="mt-0.5 size-4 shrink-0 text-acrylic" strokeWidth={2} />
                          Mesajınız bize ulaştı. En geç iki iş günü içinde {site.email} adresinden dönüş yapacağız.
                        </>
                      ) : (
                        <>
                          <AlertCircle className="mt-0.5 size-4 shrink-0" strokeWidth={2} />
                          <span>
                            {error} Dilerseniz doğrudan{' '}
                            <a href={`mailto:${site.email}`} className="underline underline-offset-2">
                              {site.email}
                            </a>{' '}
                            adresine yazabilirsiniz.
                          </span>
                        </>
                      )}
                    </span>
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          </form>
        </Reveal>
      </div>
    </section>
  )
}

function TopicPicker({ value, onChange }: { value: Topic; onChange: (t: Topic) => void }) {
  return (
    <div role="radiogroup" className="flex flex-wrap gap-2">
      {TOPICS.map((t) => {
        const selected = t === value
        return (
          <button
            key={t}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(t)}
            className={cn(
              'relative h-9 rounded-full px-4 text-[13px] transition-[color,transform] duration-200 ease-out-strong active:scale-[0.96]',
              selected ? 'text-paper-50' : 'text-graphite-700 hover:text-graphite-950',
            )}
          >
            {selected && (
              <motion.span layoutId="topic-pill" className="absolute inset-0 rounded-full bg-graphite-900" transition={spring.snappy} />
            )}
            {!selected && <span className="absolute inset-0 rounded-full border border-graphite-900/12" aria-hidden />}
            <span className="relative">{t}</span>
          </button>
        )
      })}
    </div>
  )
}

const fieldBase =
  'peer block w-full border-0 border-b border-graphite-900/15 bg-transparent px-0 pb-3 pt-7 text-[15px] text-graphite-950 ' +
  'placeholder-transparent outline-none transition-colors duration-300 focus:border-graphite-900/60 focus:ring-0'
const labelBase =
  'pointer-events-none absolute left-0 top-7 origin-left text-[15px] text-graphite-500 transition-transform duration-300 ease-out-strong ' +
  'peer-focus:-translate-y-6 peer-focus:scale-[0.8] peer-[:not(:placeholder-shown)]:-translate-y-6 peer-[:not(:placeholder-shown)]:scale-[0.8]'

function Field({ label, className, ...props }: InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  const id = useId()
  return (
    <div className={cn('relative mb-6', className)}>
      <input id={id} placeholder={label} className={fieldBase} {...props} />
      <label htmlFor={id} className={labelBase}>
        {label}
      </label>
      <FocusLine />
    </div>
  )
}

function Area({ label, className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string }) {
  const id = useId()
  return (
    <div className={cn('relative mb-2', className)}>
      <textarea id={id} rows={4} placeholder={label} className={cn(fieldBase, 'resize-none')} {...props} />
      <label htmlFor={id} className={labelBase}>
        {label}
      </label>
      <FocusLine />
    </div>
  )
}

/** Odakta soldan sağa çizilen kıvılcım çizgisi */
function FocusLine() {
  return (
    <span
      aria-hidden
      className="absolute bottom-0 left-0 h-px w-full origin-left scale-x-0 bg-acrylic transition-transform duration-500 ease-out-strong peer-focus:scale-x-100"
    />
  )
}

function SubmitButton({ status }: { status: Status }) {
  const content = {
    idle: { text: 'Gönder', icon: <ArrowUpRight className="size-4" strokeWidth={1.75} /> },
    sending: { text: 'Gönderiliyor', icon: <Loader2 className="size-4 animate-spin" strokeWidth={1.75} /> },
    sent: { text: 'Teşekkürler', icon: <Check className="size-4" strokeWidth={2} /> },
    error: { text: 'Tekrar dene', icon: <ArrowUpRight className="size-4" strokeWidth={1.75} /> },
  }[status]

  return (
    <motion.button
      type="submit"
      layout
      transition={spring.snappy}
      disabled={status === 'sending'}
      aria-live="polite"
      className={cn(
        'relative inline-flex h-14 items-center overflow-hidden rounded-full px-7 text-[15px] font-medium transition-[background-color,transform] duration-300 ease-out-strong active:scale-[0.97]',
        status === 'sent' ? 'bg-acrylic text-paper-50' : 'bg-graphite-900 text-paper-50 hover:bg-graphite-950',
      )}
    >
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={status}
          className="flex items-center gap-2"
          initial={{ opacity: 0, y: 14, filter: 'blur(4px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          exit={{ opacity: 0, y: -14, filter: 'blur(4px)' }}
          transition={{ duration: 0.3, ease: ease.out }}
        >
          {content.text}
          {content.icon}
        </motion.span>
      </AnimatePresence>
    </motion.button>
  )
}

function ContactLink({ href, label, value }: { href?: string; label: string; value: string }) {
  const inner = (
    <>
      <span className="label w-24">{label}</span>
      <span className="flex-1 text-[15px] text-graphite-900">{value}</span>
      {href && (
        <ArrowUpRight
          className="size-4 text-graphite-500 transition-transform duration-300 ease-out-strong group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-graphite-900"
          strokeWidth={1.5}
        />
      )}
    </>
  )
  const cls = 'group flex items-center gap-4 border-b border-graphite-900/10 py-4'
  return href ? (
    <a href={href} className={cls}>
      {inner}
    </a>
  ) : (
    <div className={cls}>{inner}</div>
  )
}
