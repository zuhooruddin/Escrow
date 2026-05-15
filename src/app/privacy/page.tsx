import NavSection from '@/components/landing/NavSection'
import FooterSection from '@/components/landing/FooterSection'
import PrivacyContent from './PrivacyContent'

export const metadata = { title: 'Privacy Policy — EscrowPK' }

export default function PrivacyPage() {
  return (
    <main className="min-h-screen font-['Inter',sans-serif]" style={{ background: '#F9FAF9' }}>
      <NavSection />

      {/* ── LEGAL HEADER ── */}
      <section style={{ background: '#0A1F1C', paddingTop: 80, paddingBottom: 80 }}>
        <div className="max-w-[1200px] mx-auto px-10">
          <p
            className="font-bold uppercase tracking-widest mb-5"
            style={{ fontSize: 12, color: '#C5A358' }}
          >
            Legal
          </p>
          <h1
            className="font-bold leading-[1.1] text-white"
            style={{
              fontFamily: "'Playfair Display','Libre Baskerville',Georgia,serif",
              fontSize: 'clamp(2.5rem, 6vw, 4rem)',
            }}
          >
            Privacy Policy
          </h1>
          <p className="mt-5" style={{ fontSize: 14, color: '#B1B1A5' }}>
            Last updated: May 1, 2025
          </p>
        </div>
      </section>

      <PrivacyContent />

      <FooterSection />
    </main>
  )
}
