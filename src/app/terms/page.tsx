import Link from 'next/link'
import NavSection from '@/components/landing/NavSection'
import FooterSection from '@/components/landing/FooterSection'
import {
  Clock, ShieldCheck, DollarSign, BadgeCheck, UserCheck,
  AlertTriangle, Scale, Ban, AlertCircle, FileEdit, Gavel, Phone,
} from 'lucide-react'

export const metadata = { title: 'Terms of Service — EscrowPK' }

const sections = [
  {
    id: 'acceptance',
    nav: '1. Acceptance',
    icon: Clock,
    title: '1. Acceptance of Terms',
    body: `By accessing or using EscrowPK ("the Platform"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the Platform. EscrowPK is operated by Escrowpk Contributors, Pvt. Ltd., a company registered in Pakistan.`,
  },
  {
    id: 'eligibility',
    nav: '2. Eligibility',
    icon: BadgeCheck,
    title: '2. Eligibility',
    body: `You must be at least 18 years of age and a resident of Pakistan to use EscrowPK. By creating an account, you represent and warrant that you meet these requirements. We reserve the right to terminate accounts that do not comply with eligibility requirements.`,
  },
  {
    id: 'escrow',
    nav: '3. Escrow Service',
    icon: ShieldCheck,
    title: '3. The Escrow Service',
    body: `EscrowPK acts as a neutral third-party escrow agent. When a buyer initiates a deal, funds are held securely by EscrowPK until the agreed deliverables are met. Funds are released to the seller only after the buyer confirms satisfaction, or after the dispute resolution process concludes in the seller's favour.`,
  },
  {
    id: 'fees',
    nav: '4. Fees',
    icon: DollarSign,
    title: '4. Fees',
    body: `EscrowPK charges a flat platform fee of 2% on every successfully completed transaction. This fee is deducted from the seller's payout. There are no fees for creating an account, initiating a deal, or refunded transactions. We reserve the right to update our fee structure with 30 days' notice.`,
    highlight: '2%',
  },
  {
    id: 'kyc',
    nav: '5. KYC & Verification',
    icon: UserCheck,
    title: '5. KYC & Identity Verification',
    body: `To create funded deals, all users must complete Know Your Customer (KYC) verification by submitting a valid CNIC. EscrowPK may reject or suspend accounts where verification cannot be completed or where fraudulent documents are detected. KYC information is handled in accordance with our Privacy Policy.`,
  },
  {
    id: 'obligations',
    nav: '6. User Obligations',
    icon: AlertTriangle,
    title: '6. User Obligations',
    body: `You agree to: (a) provide accurate information during registration and KYC; (b) not use the Platform for illegal transactions including money laundering or fraud; (c) not attempt to circumvent the escrow process by transacting outside the Platform after a deal is initiated; (d) maintain the confidentiality of your account credentials.`,
  },
  {
    id: 'disputes',
    nav: '7. Dispute Resolution',
    icon: Scale,
    title: '7. Dispute Resolution',
    body: `If a buyer and seller cannot resolve a disagreement, either party may raise a formal dispute through the Platform. EscrowPK's admin team will review all submitted evidence and issue a binding verdict within 72 hours. Verdicts may result in a full release to seller, full refund to buyer, or a partial split. EscrowPK's decision is final.`,
  },
  {
    id: 'prohibited',
    nav: '8. Prohibited Activities',
    icon: Ban,
    title: '8. Prohibited Activities',
    body: `You may not use EscrowPK for transactions involving: illegal goods or services, weapons, narcotics, counterfeit items, adult content, gambling, or any activity prohibited under Pakistani law. Violation of this clause results in immediate account termination and potential legal action.`,
  },
  {
    id: 'liability',
    nav: '9. Limitation of Liability',
    icon: AlertCircle,
    title: '9. Limitation of Liability',
    body: `EscrowPK is not liable for indirect, incidental, or consequential damages arising from your use of the Platform. Our total liability for any claim arising under these Terms shall not exceed the platform fees paid by you in the 3 months preceding the claim.`,
  },
  {
    id: 'modifications',
    nav: '10. Modifications to Terms',
    icon: FileEdit,
    title: '10. Modifications to Terms',
    body: `We may update these Terms at any time. We will notify registered users via email at least 14 days before material changes take effect. Continued use of the Platform after the effective date constitutes acceptance of the updated Terms.`,
  },
  {
    id: 'law',
    nav: '11. Governing Law',
    icon: Gavel,
    title: '11. Governing Law',
    body: `These Terms are governed by and construed in accordance with the laws of the Islamic Republic of Pakistan. Any disputes arising under these Terms shall be subject to the exclusive jurisdiction of the courts of Lahore, Pakistan.`,
  },
  {
    id: 'contact',
    nav: '12. Contact',
    icon: Phone,
    title: '12. Contact',
    body: `For questions about these Terms, contact us at legal@escrowpk.com or write to: Escrowpk Contributors Pvt. Ltd., Lahore, Pakistan.`,
  },
]

export default function TermsPage() {
  return (
    <main className="min-h-screen font-['Inter',sans-serif]" style={{ background: '#F8F7F2' }}>
      <NavSection />

      {/* ── LEGAL HEADER ── */}
      <section style={{ background: '#0D1F1A', paddingTop: 80, paddingBottom: 80 }}>
        <div className="max-w-[1200px] mx-auto px-10">
          <p
            className="font-bold uppercase tracking-widest mb-5"
            style={{ fontSize: 12, color: '#A6805B' }}
          >
            Legal
          </p>
          <h1
            className="font-bold leading-[1.1] text-white"
            style={{
              fontFamily: "'Playfair Display','Libre Baskerville',Georgia,serif",
              fontSize: 'clamp(2.5rem, 6vw, 4.375rem)',
            }}
          >
            Terms of Service
          </h1>
          <p className="mt-5" style={{ fontSize: 14, color: '#B1B1A5' }}>
            Last updated: May 1, 2025
          </p>
        </div>
      </section>

      {/* ── MAIN CONTENT ── */}
      <section className="max-w-[1200px] mx-auto px-10 py-16">

        {/* Summary box */}
        <div
          className="mb-16"
          style={{
            background: '#FEFDF6',
            borderRadius: 8,
            padding: 24,
            border: '1px solid #E8E0C8',
            marginBottom: 50,
          }}
        >
          <p style={{ fontSize: 15, lineHeight: 1.6, color: '#5A4A2A' }}>
            <strong>Summary:</strong> EscrowPK holds your funds securely, charges a{' '}
            <span style={{ color: '#A6805B', fontWeight: 600 }}>2% fee</span> on completed deals,
            requires identity verification, and provides binding dispute resolution.
            Please read the full terms below.
          </p>
        </div>

        {/* Two-column: sidebar nav + content */}
        <div className="grid lg:grid-cols-[220px_1fr] gap-12 items-start">

          {/* Sticky sidebar nav */}
          <nav
            className="hidden lg:block sticky top-8"
            style={{ background: '#F0EEE3', borderRadius: 12, padding: 16 }}
          >
            <ul className="space-y-1">
              {sections.map(({ id, nav, icon: Icon }) => (
                <li key={id}>
                  <a
                    href={`#${id}`}
                    className="flex items-center gap-2 rounded-lg px-3 py-2 transition-colors hover:bg-white/60 text-[#333]"
                    style={{ fontSize: 14, lineHeight: 1.4 }}
                  >
                    <Icon size={13} className="flex-shrink-0 opacity-50" />
                    {nav}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Sections */}
          <div>
            {sections.map(({ id, title, body, icon: Icon }) => (
              <div
                key={id}
                id={id}
                style={{ marginBottom: 50 }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <h2
                    style={{
                      fontFamily: "'Playfair Display','Libre Baskerville',Georgia,serif",
                      fontSize: 20,
                      fontWeight: 600,
                      lineHeight: 1.3,
                      color: '#111',
                    }}
                  >
                    {title}
                  </h2>
                  <Icon size={16} className="opacity-40 flex-shrink-0" />
                </div>
                <p style={{ fontSize: 16, lineHeight: 1.8, color: '#4A4A4A' }}>{body}</p>
              </div>
            ))}

            {/* CTA box */}
            <div
              className="text-center"
              style={{
                background: '#E9EBEA',
                borderRadius: 10,
                padding: 50,
                marginTop: 30,
              }}
            >
              <p style={{ fontSize: 18, color: '#4A4A4A' }}>Have questions about our terms?</p>
              <Link
                href="mailto:legal@escrowpk.com"
                className="inline-flex items-center font-semibold text-white transition-opacity hover:opacity-85 mt-4"
                style={{
                  background: '#142921',
                  fontSize: 14,
                  borderRadius: 4,
                  padding: '12px 24px',
                  marginTop: 15,
                }}
              >
                Contact Legal Team
              </Link>
            </div>
          </div>
        </div>
      </section>

      <FooterSection />
    </main>
  )
}
