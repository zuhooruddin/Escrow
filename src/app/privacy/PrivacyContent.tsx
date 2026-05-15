'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import {
  Database, Eye, CreditCard, Share2, Shield, Cookie,
  UserCheck, Clock, Baby, RefreshCw, Mail, Lock,
} from 'lucide-react'

const sections = [
  {
    id: 'collect',
    nav: '1. Information We Collect',
    icon: Database,
    title: '1. Information We Collect',
    body: `We collect information you provide directly, including: full name, email address, phone number, CNIC number and document images (for KYC), bank account details (IBAN, bank name, account title), and transaction data. We also automatically collect device information, IP addresses, and usage logs when you interact with the Platform.`,
  },
  {
    id: 'use',
    nav: '2. How We Use Your Information',
    icon: Eye,
    title: '2. How We Use Your Information',
    body: `We use your personal information to: verify your identity as required by Pakistani AML/KYC regulations; process and secure escrow transactions; communicate with you about your account and deals; detect and prevent fraud; comply with legal obligations; and improve the Platform. We do not sell your personal data to third parties.`,
  },
  {
    id: 'kyc',
    nav: '3. KYC Data',
    icon: UserCheck,
    title: '3. KYC Data',
    body: `Identity documents (CNIC front/back, selfies) collected during KYC are encrypted at rest and transmitted over TLS. They are stored on secure servers within Pakistan. KYC data is retained for a minimum of 5 years as required by Pakistani financial regulations and then securely deleted.`,
  },
  {
    id: 'payment',
    nav: '4. Payment & Financial Data',
    icon: CreditCard,
    title: '4. Payment & Financial Data',
    body: `Bank account details you provide are stored encrypted and used solely to process payouts. We do not store full card numbers. IBFT transaction references are logged for audit purposes. We never share your financial data with third parties except as required by law or to complete your transaction.`,
    card: true,
  },
  {
    id: 'sharing',
    nav: '5. Data Sharing',
    icon: Share2,
    title: '5. Data Sharing',
    body: `We may share your data with: (a) regulatory authorities when legally required; (b) dispute resolution partners when a formal dispute is raised; (c) cloud infrastructure providers who process data on our behalf under strict confidentiality agreements. All third parties are bound by data processing agreements.`,
    card: true,
  },
  {
    id: 'security',
    nav: '6. Data Security',
    icon: Shield,
    title: '6. Data Security',
    body: `We implement industry-standard security measures including AES-256 encryption at rest, TLS 1.3 in transit, role-based access controls, regular security audits, and intrusion detection systems. No system is perfectly secure; in the event of a breach affecting your personal data, we will notify you within 72 hours.`,
    card: true,
  },
  {
    id: 'cookies',
    nav: '7. Cookies & Tracking',
    icon: Cookie,
    title: '7. Cookies & Tracking',
    body: `We use essential cookies to maintain your session and preferences. We do not use third-party advertising trackers. Analytics are collected via privacy-friendly tools that do not share data with advertising networks. You may disable non-essential cookies in your browser settings without affecting core functionality.`,
  },
  {
    id: 'rights',
    nav: '8. Your Rights',
    icon: UserCheck,
    title: '8. Your Rights',
    body: `You have the right to: access a copy of your personal data; request correction of inaccurate data; request deletion of your account and associated data (subject to legal retention obligations); object to certain processing activities; and withdraw consent where processing is consent-based. To exercise these rights, email privacy@escrowpk.com.`,
  },
  {
    id: 'retention',
    nav: '9. Data Retention',
    icon: Clock,
    title: '9. Data Retention',
    body: `We retain your account data for as long as your account is active. Transaction records are retained for 7 years for financial compliance purposes. KYC documents are retained for 5 years. After applicable retention periods, data is securely deleted or anonymised.`,
  },
  {
    id: 'children',
    nav: '10. Children\'s Privacy',
    icon: Baby,
    title: '10. Children\'s Privacy',
    body: `EscrowPK is not intended for use by persons under 18 years of age. We do not knowingly collect personal information from minors. If we become aware that a minor has provided us with personal information, we will delete it immediately.`,
  },
  {
    id: 'changes',
    nav: '11. Changes to This Policy',
    icon: RefreshCw,
    title: '11. Changes to This Policy',
    body: `We may update this Privacy Policy periodically. We will notify you of material changes via email and by posting the updated policy on this page with a revised effective date. Your continued use of EscrowPK after changes take effect constitutes acceptance of the updated policy.`,
  },
  {
    id: 'contact',
    nav: '12. Contact Us',
    icon: Mail,
    title: '12. Contact Us',
    body: `For privacy-related questions or to exercise your rights, contact our Data Protection Officer at privacy@escrowpk.com. You may also write to: Escrowpk Contributors Pvt. Ltd., Lahore, Pakistan.`,
  },
]

export default function PrivacyContent() {
  const [activeId, setActiveId] = useState<string>('collect')
  const observerRef = useRef<IntersectionObserver | null>(null)

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (visible.length > 0) setActiveId(visible[0].target.id)
      },
      { rootMargin: '-20% 0px -70% 0px', threshold: 0 }
    )
    sections.forEach(({ id }) => {
      const el = document.getElementById(id)
      if (el) observerRef.current?.observe(el)
    })
    return () => observerRef.current?.disconnect()
  }, [])

  return (
    <section className="max-w-[1200px] mx-auto px-10 py-16">
      <div className="grid lg:grid-cols-[280px_1fr] gap-12 items-start">

        {/* ── STICKY SIDEBAR ── */}
        <nav className="hidden lg:block sticky top-8">
          <ul className="space-y-0.5">
            {sections.map(({ id, nav, icon: Icon }) => {
              const active = activeId === id
              return (
                <li key={id}>
                  <a
                    href={`#${id}`}
                    className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 transition-colors"
                    style={{
                      fontSize: 14,
                      fontWeight: 500,
                      color: active ? '#121212' : '#555',
                      background: active ? '#E8EBE9' : 'transparent',
                      textDecoration: 'none',
                    }}
                  >
                    <Icon
                      size={15}
                      style={{ color: active ? '#1A5E45' : '#888', flexShrink: 0 }}
                    />
                    {nav}
                  </a>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* ── MAIN CONTENT ── */}
        <div>
          {/* Commitment card */}
          <div
            className="grid sm:grid-cols-[1fr_auto] gap-4 items-center mb-14"
            style={{
              background: '#E8F5F1',
              borderRadius: 12,
              padding: 32,
            }}
          >
            <div>
              <p className="font-bold uppercase tracking-widest mb-2" style={{ fontSize: 13, color: '#1A5E45' }}>
                Our Commitment
              </p>
              <p style={{ fontSize: 15, lineHeight: 1.6, color: '#2D4A3E' }}>
                Your data is encrypted, never sold, and used only to provide a secure escrow service.
                We comply with Pakistani data protection regulations and retain data only as long as
                legally required.
              </p>
            </div>
            <div
              className="flex items-center justify-center flex-shrink-0"
              style={{ width: 80, height: 80, borderRadius: 12, background: 'rgba(26,94,69,0.12)' }}
            >
              <Lock size={36} style={{ color: '#1A5E45' }} />
            </div>
          </div>

          {/* Sections */}
          {sections.map(({ id, title, body, icon: Icon, card }) => (
            <div
              key={id}
              id={id}
              style={{
                ...(card
                  ? { border: '1px solid #E0E0E0', borderRadius: 12, padding: 24, marginBottom: 60 }
                  : { marginBottom: 60 }),
              }}
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <h2
                  style={{
                    fontFamily: "'Playfair Display','Libre Baskerville',Georgia,serif",
                    fontSize: 22,
                    fontWeight: 600,
                    lineHeight: 1.3,
                    color: '#121212',
                  }}
                >
                  {title}
                </h2>
                {card && (
                  <div
                    className="flex-shrink-0 flex items-center justify-center"
                    style={{ width: 40, height: 40, borderRadius: 8, background: '#F0F0F0' }}
                  >
                    <Icon size={18} style={{ color: '#555' }} />
                  </div>
                )}
              </div>
              <p style={{ fontSize: 16, lineHeight: 1.7, color: '#444444' }}>{body}</p>
            </div>
          ))}

          {/* Contact cards */}
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: 16,
              padding: 32,
              border: '1px solid #E0E0E0',
            }}
          >
            <h3 className="font-bold text-[#111] mb-6" style={{ fontSize: 20 }}>Have questions?</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                {
                  icon: Mail,
                  label: 'Privacy Questions',
                  sub: 'We may collect to maintain requests',
                  email: 'privacy@escrowpk.com',
                  href: 'mailto:privacy@escrowpk.com',
                },
                {
                  icon: Shield,
                  label: 'Legal Enquiries',
                  sub: 'For legal or compliance contact',
                  email: 'legal@escrowpk.com',
                  href: 'mailto:legal@escrowpk.com',
                },
              ].map(({ icon: Icon, label, sub, email, href }) => (
                <div key={label} style={{ background: '#F4F4F4', borderRadius: 12, padding: 20 }}>
                  <div className="flex items-center gap-2 mb-1.5">
                    <Icon size={15} style={{ color: '#555' }} />
                    <p className="font-bold text-[#111] uppercase tracking-wider" style={{ fontSize: 11 }}>
                      {label}
                    </p>
                  </div>
                  <p className="text-gray-500 mb-3" style={{ fontSize: 13 }}>{sub}</p>
                  <Link
                    href={href}
                    className="hover:underline"
                    style={{ fontSize: 15, fontWeight: 600, color: '#121212' }}
                  >
                    {email}
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
