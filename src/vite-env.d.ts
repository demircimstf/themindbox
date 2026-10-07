/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Web3Forms erişim anahtarı — iletişim formu bu anahtarla merhaba@themindbox.com.tr'ye gönderir */
  readonly VITE_WEB3FORMS_KEY?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
