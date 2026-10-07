import { MotionConfig } from 'motion/react'
import { Navbar } from '@/components/sections/Navbar'
import { Hero } from '@/components/sections/Hero'
import { HowItWorks } from '@/components/sections/HowItWorks'
import { Philosophy } from '@/components/sections/Philosophy'
import { Showcase } from '@/components/sections/Showcase'
import { Gallery } from '@/components/sections/Gallery'
import { Contact } from '@/components/sections/Contact'
import { Footer } from '@/components/sections/Footer'
import { LegalModal } from '@/components/sections/LegalModal'

export default function App() {
  return (
    // reducedMotion="user": işletim sistemi tercihine saygı — transform animasyonları kapanır, opaklık kalır
    <MotionConfig reducedMotion="user">
      <Navbar />
      <main>
        <Hero />
        <HowItWorks />
        <Philosophy />
        <Showcase />
        <Gallery />
        <Contact />
      </main>
      <Footer />
      <LegalModal />
    </MotionConfig>
  )
}
