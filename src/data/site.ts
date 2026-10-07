export const site = {
  name: 'The Mind Box',
  domain: 'themindbox.com.tr',
  email: 'merhaba@themindbox.com.tr',
  phone: '+90 542 766 55 03',
  city: 'İstanbul',
  nav: [
    { label: 'Nasıl Çalışır', href: '#nasil-calisir' },
    { label: 'Hakkımızda', href: '#felsefe' },
    { label: 'Ürünler', href: '#urunler' },
    { label: 'Deneyim', href: '#deneyim' },
    { label: 'İletişim', href: '#iletisim' },
  ],
  /**
   * "Nasıl Çalışır" videosu. Dosyalar `public/video/` altına konup buraya yazıldığında
   * bölüm, voksel demosu yerine bu videoyu sessiz, otomatik ve döngüde oynatır.
   * Örn: { webm: '/video/star6.webm', mp4: '/video/star6.mp4', poster: '/video/star6.jpg' }
   */
  howItWorksVideo: null as null | { webm?: string; mp4: string; poster?: string },
  /**
   * Veri sorumlusu bilgileri — KVKK Aydınlatma Metni ve Çerez Politikası bu alanlardan beslenir.
   * ⚠️ Köşeli parantezli değerler YER TUTUCUDUR; yayından önce şirketin resmî bilgileriyle değiştirin.
   */
  legal: {
    company: '[Şirket ticari unvanı]',
    address: '[Şirket açık adresi]',
    mersis: '[MERSİS numarası]',
    kep: '[KEP adresi — varsa]',
    updated: '7 Ekim 2026',
  },
  social: [
    { label: 'Instagram', href: 'https://instagram.com/' },
    { label: 'LinkedIn', href: 'https://linkedin.com/' },
    { label: 'YouTube', href: 'https://youtube.com/' },
  ],
} as const
