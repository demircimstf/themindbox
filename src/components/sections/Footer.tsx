import { ArrowUp, ArrowUpRight } from 'lucide-react'
import { site } from '@/data/site'
import { Logo } from '@/components/ui/Logo'

const WORDS = ['Odak', 'Sabır', 'Merak', 'Zanaat', 'Sessizlik', 'Cesaret']

// Yalnızca adresi girilmiş hesaplar gösterilir
const social = site.social.filter((s) => s.href.trim())

export function Footer() {
  const year = new Date().getFullYear()
  return (
    <footer className="relative overflow-hidden border-t border-graphite-900/10">
      {/* Yavaş kayan değerler şeridi */}
      <div className="flex overflow-hidden border-b border-graphite-900/10 py-8 [mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]" aria-hidden>
        <div className="flex shrink-0 animate-[marquee_40s_linear_infinite] gap-12 pr-12">
          {[...WORDS, ...WORDS].map((w, i) => (
            <span key={i} className="flex items-center gap-12 display font-light text-5xl text-graphite-400 md:text-7xl">
              {w}
              <span className="size-2 rounded-full bg-acrylic/70" />
            </span>
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-5 pb-10 pt-20 sm:px-8">
        <div className="grid gap-14 md:grid-cols-12">
          <div className="md:col-span-5">
            <Logo />
            <p className="mt-6 max-w-xs text-sm leading-relaxed text-graphite-500">
              Zihni açan, odağı keskinleştiren Brain Fitness bulmacaları: kutuyu aç, parçaları dök, şekli tamamla.
            </p>
          </div>

          <nav aria-label="Alt menü" className="md:col-span-3">
            <p className="label mb-5">Site</p>
            <ul className="space-y-3">
              {site.nav.map((n) => (
                <li key={n.href}>
                  <a href={n.href} className="text-sm text-graphite-700 transition-colors duration-200 hover:text-graphite-950">
                    {n.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {social.length > 0 ? (
          <div className="md:col-span-4">
            <p className="label mb-5">Takip edin</p>
            <ul className="space-y-3">
              {social.map((s) => (
                <li key={s.label}>
                  <a
                    href={s.href}
                    target="_blank"
                    rel="noreferrer"
                    className="group inline-flex items-center gap-1.5 text-sm text-graphite-700 transition-colors duration-200 hover:text-graphite-950"
                  >
                    {s.label}
                    <ArrowUpRight
                      className="size-3.5 opacity-0 transition-[opacity,transform] duration-300 ease-out-strong group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:opacity-100"
                      strokeWidth={1.5}
                    />
                  </a>
                </li>
              ))}
            </ul>
          </div>
          ) : (
            // Resmî hesaplar gelene kadar: aynı sütunda doğrudan iletişim
            <div className="md:col-span-4">
              <p className="label mb-5">İletişim</p>
              <ul className="space-y-3 text-sm">
                <li>
                  <a href={`mailto:${site.email}`} className="text-graphite-700 transition-colors duration-200 hover:text-graphite-950">
                    {site.email}
                  </a>
                </li>
                <li>
                  <a href={`tel:${site.phone.replace(/\s/g, '')}`} className="text-graphite-700 transition-colors duration-200 hover:text-graphite-950">
                    {site.phone}
                  </a>
                </li>
              </ul>
            </div>
          )}
        </div>

        {/* Dev kelime işareti — sayfanın son nefesi */}
        <p
          aria-hidden
          className="mt-24 select-none whitespace-nowrap text-center display text-[15vw] leading-[0.8] text-graphite-900/[0.07] md:mt-32"
        >
          The <span className="font-light">Mind</span> Box
        </p>

        <div className="mt-10 flex flex-col gap-4 border-t border-graphite-900/10 pt-6 text-xs text-graphite-400 sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} The Mind Box. Tüm hakları saklıdır.</p>
          <div className="flex items-center gap-6">
            <a href="#kvkk" className="transition-colors hover:text-graphite-700">KVKK Aydınlatma Metni</a>
            <a href="#cerez-politikasi" className="transition-colors hover:text-graphite-700">Çerez Politikası</a>
            <a
              href="#top"
              aria-label="Başa dön"
              className="grid size-9 place-items-center rounded-full border border-graphite-900/15 text-graphite-700 transition-[transform,color,border-color] duration-200 ease-out-strong hover:border-graphite-900/40 hover:text-graphite-950 active:scale-[0.94]"
            >
              <ArrowUp className="size-3.5" strokeWidth={1.5} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
