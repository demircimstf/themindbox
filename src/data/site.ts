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
   * Şimdilik genel bilgiler; şirketin resmî ticari unvanı, tam adresi, MERSİS ve KEP adresiyle
   * güncelleyin. Boş bırakılan alanlar (mersis, kep) metinde hiç gösterilmez.
   */
  legal: {
    company: 'The Mind Box',
    address: 'İstanbul, Türkiye',
    mersis: '',
    kep: '',
    updated: '7 Ekim 2026',
  },
  /**
   * Sosyal medya hesapları. `href` boşsa bağlantı sitede gösterilmez; resmî adres
   * yazıldığı anda alt bilgide görünür. Hepsi boşken o sütunda iletişim bilgileri yer alır.
   */
  social: [
    { label: 'Instagram', href: '' },
    { label: 'LinkedIn', href: '' },
    { label: 'YouTube', href: '' },
  ] as { label: string; href: string }[],
} as const
