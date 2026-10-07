# The Mind Box — themindbox.com.tr

IQ Puzzle "Brain Fitness" bulmaca setlerinin tanıtım sitesi. E-ticaret içermez; tek sayfalık, statik bir sitedir.

**Teknoloji:** Vite · React 19 · TypeScript · Tailwind CSS v4 · Motion · lucide-react

## Geliştirme

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # tür denetimi + üretim çıktısı → dist/
npm run preview    # üretim çıktısını yerelde sun
```

Node sürümü: `^20.19.0 || >=22.12.0` (bkz. `.nvmrc`).

## Ortam değişkenleri

| Değişken | Açıklama |
|---|---|
| `VITE_WEB3FORMS_KEY` | İletişim formunun anahtarı. [web3forms.com](https://web3forms.com) üzerinden `merhaba@themindbox.com.tr` ile alınır. |

Yerelde `.env.example` dosyasını `.env` olarak kopyalayın. Yayında, barındırma servisinin ortam değişkenlerine ekleyin. `.env` git'e eklenmez.

Anahtar tanımlı değilse form gönderim yapmaz; ziyaretçiye doğrudan e-posta bağlantısı gösterir.

## İçerik nerede?

| Ne | Dosya |
|---|---|
| İletişim bilgileri, menü, sosyal medya, şirket bilgileri | `src/data/site.ts` |
| Ürünler | `src/data/products.ts` |
| Galeri | `src/data/gallery.ts` |
| KVKK Aydınlatma Metni, Çerez Politikası | `src/data/legal.ts` |
| Bulmaca şekilleri ve parça geometrisi | `src/components/visual/puzzles.tsx` |

**Şirket bilgileri:** `src/data/site.ts` → `legal` şimdilik genel bilgilerle doludur (The Mind Box, İstanbul). Resmî ticari unvan, tam adres, MERSİS ve KEP ile güncelleyin. Boş bırakılan MERSİS/KEP alanları metinde gösterilmez. Yasal metinleri bir hukukçuya gözden geçirtin.

**Sosyal medya:** `src/data/site.ts` → `social`. `href` boş olan hesaplar gösterilmez. Hepsi boşken alt bilgide o sütunda iletişim bilgileri yer alır.

**SEO:** `public/robots.txt`, `public/sitemap.xml`, `public/og-image.png` (1200×630 link önizleme görseli). İçerik büyük ölçüde değiştiğinde `sitemap.xml` içindeki `lastmod` tarihini güncelleyin.

Yasal metinler doğrudan bağlantıyla açılabilir: `/#kvkk`, `/#cerez-politikasi`.

## Yayın (Cloudflare Pages veya Vercel)

Site statiktir; sunucu veya veritabanı gerekmez. Her iki servis de ücretsiz plan sunar.

- **Build komutu:** `npm run build`
- **Çıktı klasörü:** `dist`
- **Ortam değişkeni:** `VITE_WEB3FORMS_KEY`

Yapılandırma hazırdır:
- `vercel.json`: Vercel ayarları ve HTTP başlıkları
- `public/_headers`: Cloudflare Pages başlıkları

GitHub'a gönderilen her commit otomatik olarak yayına alınır.
