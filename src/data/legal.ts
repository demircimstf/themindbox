import { site } from './site'

/**
 * Yasal metinler — KVKK Aydınlatma Metni ve Çerez Politikası.
 *
 * ⚠️ Bu metinler 6698 sayılı KVK Kanunu (m.5, m.8, m.9, m.10, m.11) ve Aydınlatma
 * Yükümlülüğünün Yerine Getirilmesinde Uyulacak Usul ve Esaslar Hakkında Tebliğ esas
 * alınarak, sitenin GERÇEK veri akışına göre hazırlanmış bir taslaktır. Yayından önce
 * şirket bilgileri (site.ts → legal) doldurulmalı ve bir hukukçu tarafından gözden
 * geçirilmelidir.
 */
export type LegalBlock = string | { list: string[] }

export interface LegalSection {
  heading: string
  blocks: LegalBlock[]
}

export interface LegalDoc {
  id: 'kvkk' | 'cerez-politikasi'
  title: string
  kicker: string
  intro: string
  sections: LegalSection[]
}

const { company, address, mersis, kep, updated } = site.legal

export const kvkk: LegalDoc = {
  id: 'kvkk',
  kicker: 'Kişisel Verilerin Korunması',
  title: 'KVKK Aydınlatma Metni',
  // Resmî unvan girildiğinde marka adı ayrıca belirtilir; şimdilik marka adı tek başına
  intro: `${company === 'The Mind Box' ? 'The Mind Box ("Şirket")' : `${company} ("The Mind Box" veya "Şirket")`} olarak kişisel verilerinizin güvenliğine önem veriyoruz. Bu metin, 6698 sayılı Kişisel Verilerin Korunması Kanunu'nun ("KVKK") 10. maddesi uyarınca, ${site.domain} web sitesi aracılığıyla işlenen kişisel verileriniz hakkında sizi bilgilendirmek amacıyla hazırlanmıştır.`,
  sections: [
    {
      heading: '1. Veri sorumlusu',
      blocks: [
        `KVKK kapsamında veri sorumlusu: ${company}.`,
        {
          list: [
            `Adres: ${address}`,
            mersis && `MERSİS: ${mersis}`,
            `E-posta: ${site.email}`,
            `Telefon: ${site.phone}`,
            kep && `KEP: ${kep}`,
          ].filter((v): v is string => Boolean(v)),
        },
      ],
    },
    {
      heading: '2. İşlenen kişisel verileriniz',
      blocks: [
        'İletişim formunu kullandığınızda veya bize doğrudan ulaştığınızda aşağıdaki veriler işlenir:',
        {
          list: [
            'Kimlik: ad ve soyad',
            'İletişim: e-posta adresi (telefonla ulaşırsanız telefon numarası)',
            'Mesleki bilgi: kurum adı (isteğe bağlı)',
            'Talep bilgisi: seçtiğiniz konu ve mesajınızın içeriği',
            'İşlem güvenliği: IP adresi, tarayıcı bilgisi ve erişim zamanı gibi, barındırma ve form iletim hizmetlerinin teknik olarak tuttuğu kayıtlar',
          ],
        },
        'Sitemiz reklam, analitik veya izleme amaçlı çerez kullanmaz; ayrıntılar için Çerez Politikası’na bakabilirsiniz.',
      ],
    },
    {
      heading: '3. İşleme amaçları',
      blocks: [
        {
          list: [
            'Ürün bilgisi, iş birliği, kurumsal hediye ve basın taleplerinizi almak, değerlendirmek ve yanıtlamak',
            'Sizinle talebiniz kapsamında iletişime geçmek ve teklif süreçlerini yürütmek',
            'Web sitesinin ve iletişim kanallarının güvenliğini sağlamak, kötüye kullanımı (spam) önlemek',
            'Mevzuattan doğan yükümlülükleri yerine getirmek ve yetkili kurumların taleplerini karşılamak',
          ],
        },
      ],
    },
    {
      heading: '4. Hukuki sebepler',
      blocks: [
        'Kişisel verileriniz KVKK’nın 5. maddesinin 2. fıkrasında yer alan şu hukuki sebeplere dayanılarak işlenir:',
        {
          list: [
            '(c) Bir sözleşmenin kurulması veya ifasıyla doğrudan doğruya ilgili olması — teklif ve sipariş öncesi talepler için',
            '(ç) Veri sorumlusunun hukuki yükümlülüğünü yerine getirebilmesi için zorunlu olması',
            '(f) İlgili kişinin temel hak ve özgürlüklerine zarar vermemek kaydıyla, veri sorumlusunun meşru menfaatleri için zorunlu olması — taleplere yanıt verilmesi ve bilgi güvenliğinin sağlanması',
          ],
        },
      ],
    },
    {
      heading: '5. Toplama yöntemi',
      blocks: [
        'Kişisel verileriniz; web sitemizdeki iletişim formu, e-posta ve telefon kanalları aracılığıyla elektronik ortamda, kısmen otomatik yollarla toplanır.',
      ],
    },
    {
      heading: '6. Aktarım',
      blocks: [
        'Kişisel verileriniz, yalnızca yukarıdaki amaçlarla sınırlı olmak üzere ve KVKK’nın 8. ve 9. maddelerine uygun olarak aşağıdaki alıcılara aktarılabilir:',
        {
          list: [
            'Form iletim hizmeti (Web3Forms): formdaki bilgileri tarafımıza e-posta olarak iletmek için',
            'Barındırma ve içerik dağıtım hizmeti (Cloudflare / Vercel): sitenin güvenli ve hızlı sunulması için',
            'E-posta hizmet sağlayıcımız: mesajınızın tarafımıza ulaşması ve yanıtlanması için',
            'Yetkili kamu kurum ve kuruluşları: yasal olarak talep edilmesi hâlinde',
          ],
        },
        'Bu hizmet sağlayıcıların sunucuları yurt dışında bulunabilir. Yurt dışına aktarım, KVKK’nın 9. maddesi ve ilgili yönetmelik çerçevesinde öngörülen uygun güvencelerle (ör. Kurul’a bildirilen standart sözleşmeler) gerçekleştirilir.',
      ],
    },
    {
      heading: '7. Saklama süresi',
      blocks: [
        'Talebinize ilişkin veriler, talebin sonuçlanmasından itibaren 2 (iki) yıl süreyle; bir uyuşmazlık söz konusu olduğunda ise ilgili mevzuattaki zamanaşımı süreleri boyunca saklanır. Sürenin dolmasıyla veriler silinir, yok edilir veya anonim hâle getirilir.',
      ],
    },
    {
      heading: '8. Haklarınız',
      blocks: [
        'KVKK’nın 11. maddesi uyarınca veri sorumlusuna başvurarak:',
        {
          list: [
            'Kişisel verilerinizin işlenip işlenmediğini öğrenme,',
            'İşlenmişse buna ilişkin bilgi talep etme,',
            'İşlenme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme,',
            'Yurt içinde veya yurt dışında aktarıldığı üçüncü kişileri bilme,',
            'Eksik veya yanlış işlenmişse düzeltilmesini isteme,',
            'KVKK’nın 7. maddesindeki şartlar çerçevesinde silinmesini veya yok edilmesini isteme,',
            'Düzeltme, silme ve yok etme işlemlerinin, verilerin aktarıldığı üçüncü kişilere bildirilmesini isteme,',
            'Münhasıran otomatik sistemlerle analiz edilmesi sonucu aleyhinize bir sonucun ortaya çıkmasına itiraz etme,',
            'Kanuna aykırı işlenmesi sebebiyle zarara uğramanız hâlinde zararın giderilmesini talep etme',
          ],
        },
        'haklarına sahipsiniz.',
      ],
    },
    {
      heading: '9. Başvuru yolu',
      blocks: [
        `Haklarınıza ilişkin taleplerinizi, Veri Sorumlusuna Başvuru Usul ve Esasları Hakkında Tebliğ’e uygun olarak; ${address} adresine yazılı olarak${kep ? `, ${kep} adresine KEP ile` : ''} veya sistemimizde kayıtlı e-posta adresinizden ${site.email} adresine iletebilirsiniz.`,
        'Başvurunuz, niteliğine göre en kısa sürede ve en geç 30 (otuz) gün içinde ücretsiz olarak sonuçlandırılır. İşlemin ayrıca bir maliyet gerektirmesi hâlinde, Kişisel Verileri Koruma Kurulu’nca belirlenen tarifedeki ücret alınabilir.',
      ],
    },
  ],
}

export const cookies: LegalDoc = {
  id: 'cerez-politikasi',
  kicker: 'Ziyaretçi bilgilendirmesi',
  title: 'Çerez Politikası',
  intro: `Bu politika, ${site.domain} web sitesini ziyaret ettiğinizde tarayıcınızda hangi verilerin saklandığını sade bir dille açıklar. Kısaca: sitemiz sizi izlemez.`,
  sections: [
    {
      heading: 'Çerez nedir?',
      blocks: [
        'Çerezler, ziyaret ettiğiniz web sitelerinin tarayıcınıza kaydettiği küçük metin dosyalarıdır. Oturumu açık tutmak gibi teknik işler için kullanılabildikleri gibi, ziyaretçi davranışını ölçmek veya reklam göstermek için de kullanılabilirler.',
      ],
    },
    {
      heading: 'Bu sitede kullandıklarımız',
      blocks: [
        {
          list: [
            'Reklam, pazarlama veya yeniden hedefleme çerezi: kullanılmaz.',
            'Analitik / ziyaretçi ölçüm çerezi (ör. Google Analytics): kullanılmaz.',
            'Sosyal medya eklentisi veya üçüncü taraf takip kodu: bulunmaz.',
            'Yazı tipleri ve tüm görseller doğrudan kendi sunucumuzdan sunulur; bu amaçla üçüncü taraflara bağlantı kurulmaz.',
          ],
        },
        'Sitemizin barındırma ve güvenlik hizmeti sağlayıcısı, kötü niyetli trafiği engellemek amacıyla kısa ömürlü, zorunlu teknik çerezler kullanabilir. Bu çerezler kişisel tercihlerinizi izlemez ve sitenin güvenli çalışması için gereklidir.',
      ],
    },
    {
      heading: 'İletişim formu',
      blocks: [
        'İletişim formunu gönderdiğinizde bilgileriniz çerez aracılığıyla değil, doğrudan form iletim hizmeti üzerinden tarafımıza iletilir. Bu verilerin nasıl işlendiği KVKK Aydınlatma Metni’nde açıklanmıştır.',
      ],
    },
    {
      heading: 'Çerezleri nasıl yönetebilirsiniz?',
      blocks: [
        'Tarayıcınızın ayarlarından çerezleri görüntüleyebilir, silebilir veya engelleyebilirsiniz. Zorunlu teknik çerezlerin engellenmesi, sitenin bazı bölümlerinin düzgün çalışmamasına yol açabilir.',
      ],
    },
    {
      heading: 'Değişiklikler',
      blocks: [
        `İleride ölçüm veya pazarlama amaçlı bir araç kullanmaya karar verirsek, bunu bu politikada açıkça belirtir ve gerekli durumlarda önceden onayınızı alırız. Sorularınız için: ${site.email}`,
      ],
    },
  ],
}

export const legalDocs = { kvkk, 'cerez-politikasi': cookies } as const
export type LegalId = keyof typeof legalDocs
export const LEGAL_UPDATED = updated
