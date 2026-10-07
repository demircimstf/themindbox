/**
 * İletişim formu → Web3Forms → merhaba@themindbox.com.tr
 *
 * Web3Forms erişim anahtarı, web3forms.com'da hedef e-posta adresiyle alınır ve
 * `VITE_WEB3FORMS_KEY` ortam değişkeniyle verilir (yerelde `.env`, yayında Vercel /
 * Cloudflare Pages ayarları). Anahtar herkese açık olacak şekilde tasarlanmıştır —
 * yalnızca o adrese gönderim yapabilir; yine de koda gömülmez ki kolayca değiştirilebilsin.
 */
const ENDPOINT = 'https://api.web3forms.com/submit'

export interface ContactPayload {
  name: string
  email: string
  company: string
  topic: string
  message: string
  /** Bal küpü alanı: insanlar görmez; doluysa gönderim bot kabul edilir */
  botcheck: string
}

export class ContactError extends Error {
  constructor(
    message: string,
    readonly reason: 'config' | 'network' | 'rejected',
  ) {
    super(message)
  }
}

export async function sendContact(data: ContactPayload): Promise<void> {
  const key = import.meta.env.VITE_WEB3FORMS_KEY
  if (!key) throw new ContactError('Form henüz yapılandırılmadı (VITE_WEB3FORMS_KEY eksik).', 'config')
  // Bot: sessizce "başarılı" say, hiçbir şey gönderme
  if (data.botcheck) return

  let res: Response
  try {
    res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        access_key: key,
        subject: `[The Mind Box] ${data.topic} — ${data.name}`,
        from_name: 'The Mind Box web sitesi',
        replyto: data.email, // "Yanıtla" doğrudan ziyaretçiye gider
        'Ad Soyad': data.name,
        'E-posta': data.email,
        Kurum: data.company || '—',
        Konu: data.topic,
        Mesaj: data.message,
      }),
    })
  } catch {
    throw new ContactError('Bağlantı kurulamadı. İnternet bağlantınızı kontrol edip tekrar deneyin.', 'network')
  }

  const body = (await res.json().catch(() => null)) as { success?: boolean; message?: string } | null
  if (!res.ok || !body?.success) {
    // Servisin (İngilizce) teknik mesajı ziyaretçiye değil, geliştirici konsoluna
    console.error('[İletişim formu] Web3Forms reddetti:', res.status, body?.message)
    throw new ContactError('Mesajınız şu an gönderilemedi.', 'rejected')
  }
}
