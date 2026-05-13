import BigCTASection from '@/components/landing/BigCTASection'
import BuiltForSection from '@/components/landing/BuiltForSection'
import FooterSection from '@/components/landing/FooterSection'
import HeroSection from '@/components/landing/HeroSection'
import NavSection from '@/components/landing/NavSection'
import PricingSection from '@/components/landing/PricingSection'
import ProcessSection from '@/components/landing/ProcessSection'
import TrustedBySection from '@/components/landing/TrustMarquee'
import UseCasesSection from '@/components/landing/UseCasesSection'

/** In-page anchors: section `id`s + `components/landing/navLinks.ts`. Auth: `/auth/login`, `/auth/register`. */

const App = () => (
  <main className="min-h-screen bg-page">
    <NavSection />
    <HeroSection />
    <TrustedBySection />
    <ProcessSection />
    <BuiltForSection />
    <UseCasesSection />
    <PricingSection />
    <BigCTASection />
    <FooterSection />
  </main>
)

export default App
