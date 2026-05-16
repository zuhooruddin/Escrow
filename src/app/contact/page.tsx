import Link from 'next/link'
import NavSection from '@/components/landing/NavSection'
import FooterSection from '@/components/landing/FooterSection'
import { Mail, Phone, MapPin, Clock, MessageSquare, ShieldCheck, FileText } from 'lucide-react'

export const metadata = { title: 'Contact Us — Rakhwali PK' }

const channels = [
  {
    icon: Mail,
    title: 'Email Support',
    desc: 'For general inquiries and account help',
    value: 'support@rakhwalipk.com',
    href: 'mailto:support@rakhwalipk.com',
    badge: 'Replies within 24h',
    badgeStyle: { background: '#E8F5E9', color: '#2E7D32' },
  },
  {
    icon: ShieldCheck,
    title: 'Legal & Compliance',
    desc: 'Privacy, terms, and regulatory matters',
    value: 'legal@rakhwalipk.com',
    href: 'mailto:legal@rakhwalipk.com',
    badge: 'Replies within 48h',
    badgeStyle: { background: '#E3F2FD', color: '#1565C0' },
  },
  {
    icon: MessageSquare,
    title: 'Dispute Resolution',
    desc: 'Escalate an unresolved transaction issue',
    value: 'disputes@rakhwalipk.com',
    href: 'mailto:disputes@rakhwalipk.com',
    badge: 'Priority queue',
    badgeStyle: { background: '#FFF8E1', color: '#F57F17' },
  },
]

const faqs = [
  {
    q: 'How long does it take to verify my IBFT payment?',
    a: 'Our team verifies IBFT bank transfers within 2–4 business hours during working days (Mon–Sat, 9am–6pm PKT).',
  },
  {
    q: 'My KYC was rejected — what should I do?',
    a: 'Re-upload a clear, unedited photo of your CNIC (both sides) and a selfie in good lighting. Make sure the document is not expired.',
  },
  {
    q: 'Can I cancel a deal after funding?',
    a: 'Once a deal is funded, it can only be cancelled with mutual consent from both parties, or through the dispute resolution process.',
  },
  {
    q: 'How do I raise a dispute?',
    a: 'Inside your deal page, click "Raise Dispute" and provide your reason along with any evidence. Our team reviews within 72 hours.',
  },
  {
    q: 'When will my payout arrive?',
    a: 'Payouts are processed within 1–2 business days after a deal is marked completed and the admin records the transfer.',
  },
]

export default function ContactPage() {
  return (
    <main className="min-h-screen font-['Inter',sans-serif]" style={{ background: '#F8F7F2' }}>
      <NavSection />

      {/* ── HERO ── */}
      <section style={{ background: '#121212', paddingTop: 90, paddingBottom: 90 }}>
        <div className="max-w-[1200px] mx-auto px-6 text-center">
          <p
            className="font-semibold uppercase tracking-[0.22em] mb-4"
            style={{ fontSize: 11, color: '#C5A358' }}
          >
            Get in Touch
          </p>
          <h1
            className="font-bold text-white mb-5 leading-[1.15]"
            style={{ fontFamily: "'Playfair Display', 'Libre Baskerville', Georgia, serif", fontSize: 'clamp(32px, 5vw, 48px)' }}
          >
            We're here to help
          </h1>
          <p
            className="mx-auto leading-relaxed"
            style={{ fontSize: 18, color: '#A0A0A0', maxWidth: 600, lineHeight: 1.6 }}
          >
            Whether you have a question about a deal, need help with KYC, or want
            to report an issue — our team is ready.
          </p>
        </div>
      </section>

      {/* ── CONTACT CARDS — overlap hero ── */}
      <div className="max-w-[1200px] mx-auto px-6 -mt-14 relative z-10">
        <div className="grid sm:grid-cols-3 gap-5">
          {channels.map(({ icon: Icon, title, desc, value, href, badge, badgeStyle }) => (
            <a
              key={title}
              href={href}
              className="group block transition-all hover:-translate-y-1"
              style={{
                background: '#FFFFFF',
                borderRadius: 12,
                border: '1px solid #E0E0E0',
                boxShadow: '0px 4px 20px rgba(0,0,0,0.05)',
                padding: 32,
              }}
            >
              <div
                className="flex items-center justify-center mb-5"
                style={{ width: 44, height: 44, borderRadius: 10, background: '#121212' }}
              >
                <Icon size={20} style={{ color: '#C5A358' }} />
              </div>
              <span
                className="inline-block font-bold mb-3"
                style={{ ...badgeStyle, fontSize: 12, borderRadius: 20, padding: '4px 12px' }}
              >
                {badge}
              </span>
              <h3 className="font-semibold text-[#111] mb-1.5" style={{ fontSize: 16 }}>{title}</h3>
              <p className="text-gray-500 mb-4" style={{ fontSize: 14, lineHeight: 1.6 }}>{desc}</p>
              <p
                className="font-medium underline group-hover:text-[#1B332F] transition-colors"
                style={{ fontSize: 14, color: '#333', fontFamily: 'monospace' }}
              >
                {value}
              </p>
            </a>
          ))}
        </div>

        {/* ── INFO BAR ── */}
        <div
          className="mt-5 flex flex-wrap items-center justify-around gap-6 px-8 py-4"
          style={{ background: '#F0F0F0', borderRadius: 50 }}
        >
          {[
            { icon: Clock,  label: 'Support Hours', value: 'Mon – Sat, 9am – 6pm PKT' },
            { icon: MapPin, label: 'Headquarters',  value: 'Lahore, Punjab, Pakistan' },
            { icon: Phone,  label: 'WhatsApp Only', value: '+92 300 000 0000' },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-center gap-3">
              <Icon size={16} style={{ color: '#555' }} />
              <div>
                <p className="uppercase tracking-widest text-gray-400" style={{ fontSize: 11 }}>{label}</p>
                <p className="font-bold text-[#111]" style={{ fontSize: 15 }}>{value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── FORM + FAQ ── */}
      <section className="max-w-[1200px] mx-auto px-6 py-16">
        <div className="grid lg:grid-cols-[1fr_420px] gap-10">

          {/* Form */}
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: 16,
              border: '1px solid #E0E0E0',
              padding: 40,
              boxShadow: '0px 4px 20px rgba(0,0,0,0.04)',
            }}
          >
            <h2 className="font-bold text-[#111] mb-1" style={{ fontSize: 22 }}>Send us a message</h2>
            <p className="text-gray-500 mb-7" style={{ fontSize: 14 }}>We'll get back to you within one business day.</p>

            <form className="space-y-5">
              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label className="block font-bold text-[#333] mb-2" style={{ fontSize: 14 }}>Full Name</label>
                  <input
                    type="text"
                    placeholder="e.g., Ali Hassan"
                    className="w-full outline-none transition-all focus:border-[#1B332F] focus:ring-2 focus:ring-[#1B332F]/10"
                    style={{ height: 48, padding: '0 14px', fontSize: 14, border: '1px solid #D1D1D1', borderRadius: 10, background: '#FAFAFA' }}
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#333] mb-2" style={{ fontSize: 14 }}>Email Address</label>
                  <input
                    type="email"
                    placeholder="ali@example.com"
                    className="w-full outline-none transition-all focus:border-[#1B332F] focus:ring-2 focus:ring-[#1B332F]/10"
                    style={{ height: 48, padding: '0 14px', fontSize: 14, border: '1px solid #D1D1D1', borderRadius: 10, background: '#FAFAFA' }}
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#333] mb-2" style={{ fontSize: 14 }}>Subject</label>
                <select
                  className="w-full outline-none transition-all focus:border-[#1B332F] text-gray-700"
                  style={{ height: 48, padding: '0 14px', fontSize: 14, border: '1px solid #D1D1D1', borderRadius: 10, background: '#FAFAFA', appearance: 'none' }}
                >
                  <option value="">Select a topic...</option>
                  <option>Account & KYC</option>
                  <option>Deal & Payment Issue</option>
                  <option>Dispute Help</option>
                  <option>Payout Not Received</option>
                  <option>Technical Problem</option>
                  <option>Partnership Enquiry</option>
                  <option>Other</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-[#333] mb-2" style={{ fontSize: 14 }}>
                  Deal Number <span className="font-normal text-gray-400">(optional)</span>
                </label>
                <input
                  type="text"
                  placeholder="EPK-XXXXXXXX"
                  className="w-full outline-none transition-all focus:border-[#1B332F] focus:ring-2 focus:ring-[#1B332F]/10 font-mono"
                  style={{ height: 48, padding: '0 14px', fontSize: 14, border: '1px solid #D1D1D1', borderRadius: 10, background: '#FAFAFA' }}
                />
              </div>

              <div>
                <label className="block font-bold text-[#333] mb-2" style={{ fontSize: 14 }}>Message</label>
                <textarea
                  rows={5}
                  placeholder="Describe your issue in detail..."
                  className="w-full outline-none transition-all focus:border-[#1B332F] focus:ring-2 focus:ring-[#1B332F]/10 resize-none"
                  style={{ padding: '12px 14px', fontSize: 14, border: '1px solid #D1D1D1', borderRadius: 10, background: '#FAFAFA' }}
                />
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 font-semibold text-white transition-colors hover:opacity-90"
                style={{ height: 48, fontSize: 16, background: '#1B332F', borderRadius: 10 }}
              >
                <Mail size={16} />
                Send Message
              </button>
            </form>
          </div>

          {/* FAQ */}
          <div>
            <h2 className="font-bold text-[#111] mb-6" style={{ fontSize: 24 }}>Frequently asked</h2>
            <div className="space-y-3">
              {faqs.map(({ q, a }) => (
                <details
                  key={q}
                  className="group overflow-hidden"
                  style={{ background: '#FFFFFF', border: '1px solid #E0E0E0', borderRadius: 12 }}
                >
                  <summary
                    className="flex items-center justify-between gap-3 cursor-pointer list-none"
                    style={{ padding: '0 20px', height: 60 }}
                  >
                    <span className="font-medium text-[#111] leading-snug" style={{ fontSize: 15 }}>{q}</span>
                    <span
                      className="flex-shrink-0 flex items-center justify-center font-bold group-open:rotate-45 transition-transform duration-200"
                      style={{ width: 22, height: 22, borderRadius: '50%', background: '#F0F0F0', color: '#333', fontSize: 16 }}
                    >
                      +
                    </span>
                  </summary>
                  <div style={{ padding: '0 20px 18px' }}>
                    <p className="text-gray-500" style={{ fontSize: 14, lineHeight: 1.6 }}>{a}</p>
                  </div>
                </details>
              ))}
            </div>

            {/* Dispute CTA card */}
            <div
              className="mt-5 text-center"
              style={{ background: '#121212', borderRadius: 16, padding: '28px 24px' }}
            >
              <FileText size={24} style={{ color: '#C5A358', margin: '0 auto 10px' }} />
              <p className="font-bold text-white mb-1.5" style={{ fontSize: 15 }}>Need to raise a dispute?</p>
              <p className="text-white/50 mb-5" style={{ fontSize: 13, lineHeight: 1.6 }}>
                Log in and open the deal page to file a formal dispute.
              </p>
              <Link
                href="/auth/login"
                className="inline-flex items-center font-semibold text-[#111] transition-opacity hover:opacity-90"
                style={{ background: '#D4AF37', fontSize: 13, borderRadius: 40, padding: '10px 28px' }}
              >
                Go to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </section>

      <FooterSection />
    </main>
  )
}
