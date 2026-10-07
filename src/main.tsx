import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// Yazı tipleri siteyle birlikte sunulur (Google Fonts yok): ziyaretçinin IP adresi üçüncü
// tarafa gitmez, KVKK kapsamında yurt dışına aktarım oluşmaz ve sayfa daha hızlı açılır.
import '@fontsource-variable/geist'
import '@fontsource/geist-mono/400.css'
import '@fontsource/geist-mono/500.css'
import App from './App'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
