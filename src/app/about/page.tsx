import Link from 'next/link'
import NavSection from '@/components/landing/NavSection'
import FooterSection from '@/components/landing/FooterSection'
import { ShieldCheck, Users, Zap, Globe } from 'lucide-react'

export const metadata = { title: 'About Us — Rakhwali PK' }

const values = [
  {
    icon: ShieldCheck,
    title: 'Trust First',
    desc: 'Every rupee is held securely in escrow until both parties are satisfied. Your money never moves without your consent.',
  },
  {
    icon: Users,
    title: 'Built for Pakistan',
    desc: 'Designed from the ground up for Pakistani buyers and sellers — IBFT support, local banks, and PKR-native flows.',
  },
  {
    icon: Zap,
    title: 'Fast & Simple',
    desc: 'Create a deal in under 2 minutes. No complex onboarding, no hidden paperwork — just a link and a handshake.',
  },
  {
    icon: Globe,
    title: 'Open Platform',
    desc: 'From freelancers to vehicle dealers, Rakhwali PK platform gives any transaction both parties protection.',
  },
]

const team = [
  { name: 'Ahmad Raza',      role: 'Co-Founder & CEO',       initials: 'AR' },
  { name: 'Fatima Malik',    role: 'Co-Founder & CTO',       initials: 'FM' },
  { name: 'Hassan Siddiqui', role: 'Head of Operations',     initials: 'HS' },
  { name: 'Zara Khan',       role: 'Head of Product Design', initials: 'ZK' },
]

export default function AboutPage() {
  return (
    <main className="min-h-screen flex flex-col font-['Inter',sans-serif]">
      <NavSection />

      {/* Two-column split — left changes bg, right stays dark */}
      <div className="flex-1 grid md:grid-cols-2">

        {/* ── LEFT COLUMN ── */}
        <div className="flex flex-col">

          {/* Hero — dark, min 340px */}
          <div className="bg-[#0D2A26] px-10 pt-20 pb-16" style={{ minHeight: 340 }}>
            <p className="text-[11px] font-semibold tracking-[0.22em] uppercase text-[#c9a15a] mb-5">
              About Rakhwali PK
            </p>
            <h1
              className="font-extrabold leading-[1.2] tracking-tight text-white mb-5"
              style={{ fontSize: 'clamp(2.1rem, 3.5vw, 2.75rem)' }}
            >
              Pakistan's most trusted<br />escrow platform
            </h1>
            <p className="text-white/55 max-w-[60%]" style={{ fontSize: 16, lineHeight: 1.6 }}>
              We started Rakhwali PK because online trust in Pakistan was broken. Buyers got scammed,
              sellers went unpaid. We built a simple, secure escrow layer so every transaction —
              big or small — is protected.
            </p>
          </div>

          {/* Mission — light */}
          <div className="bg-[#f5f3ee] px-10 py-14">
            <p className="text-[11px] font-semibold tracking-[0.22em] uppercase text-[#c9a15a] mb-4">
              Our Mission
            </p>
            <h2 className="font-extrabold text-[#0d2a1f] leading-tight mb-5" style={{ fontSize: 22 }}>
              Make every Pakistani<br />transaction safe
            </h2>
            <p className="text-gray-500 mb-3" style={{ fontSize: 15, lineHeight: 1.6 }}>
              Commerce shouldn't require blind trust. Whether you're paying a freelancer in Karachi,
              buying a car in Lahore, or closing a deal with a supplier in Islamabad — Rakhwali PK
              holds funds securely until both sides are satisfied.
            </p>
            <p className="text-gray-500 mb-8" style={{ fontSize: 15, lineHeight: 1.6 }}>
              We charge a transparent 2% fee, support all major Pakistani banks via IBFT,
              and offer built-in dispute resolution so you're never left stranded.
            </p>

            {/* Stats widget */}
            <div className="bg-white rounded-2xl border border-[#e0ddd4] p-5 shadow-sm max-w-xs">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold text-[#0d2a1f]">Low Fees</span>
                <span className="flex items-center gap-1.5 text-emerald-600 font-semibold" style={{ fontSize: 10 }}>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                  Live monitoring
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: '2%',   label: 'Flat platform fee' },
                  { value: 'PKR',  label: 'Native currency' },
                  { value: '24h',  label: 'Dispute response' },
                  { value: '100%', label: 'Funds protected' },
                ].map(({ value, label }) => (
                  <div key={value} className="text-center p-3 rounded-xl bg-[#f5f3ee]">
                    <p className="font-bold text-[#0d2a1f] tracking-tight" style={{ fontSize: 24 }}>{value}</p>
                    <p className="text-gray-500 mt-0.5" style={{ fontSize: 11 }}>{label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Values — white cards on light bg */}
          <div className="bg-[#f5f3ee] px-10 pb-16 flex-1">
            <p className="text-[11px] font-semibold tracking-[0.22em] uppercase text-[#c9a15a] mb-3">
              Our Values
            </p>
            <h2 className="font-extrabold text-[#0d2a1f] mb-12" style={{ fontSize: 22 }}>
              What we stand for
            </h2>
            <div className="grid grid-cols-2 gap-6">
              {values.map(({ icon: Icon, title, desc }) => (
                <div key={title} className="bg-white rounded-2xl border border-[#e0ddd4] p-6">
                  <div className="w-10 h-10 rounded-xl bg-[#0D2A26] flex items-center justify-center mb-3">
                    <Icon size={20} className="text-[#c9a15a]" />
                  </div>
                  <h3 className="font-semibold text-[#0d2a1f] mb-2" style={{ fontSize: 17 }}>{title}</h3>
                  <p className="text-gray-500" style={{ fontSize: 15, lineHeight: 1.6 }}>{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── RIGHT COLUMN — always dark ── */}
        <div className="bg-[#0D2A26] px-10 pt-20 pb-16 flex flex-col gap-14">

          {/* Values preview cards */}
          <div>
            <p className="text-[11px] font-semibold tracking-[0.22em] uppercase text-[#c9a15a] mb-3">
              Our Values
            </p>
            <h2 className="font-extrabold text-white mb-6" style={{ fontSize: 22 }}>
              People behind Rakhwali PK
            </h2>
            <div className="grid grid-cols-2 gap-6">
              {values.map(({ icon: Icon, title, desc }) => (
                <div key={title} className="rounded-2xl p-6 bg-white/5 border border-white/10">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center mb-3">
                    <Icon size={20} className="text-[#c9a15a]" />
                  </div>
                  <h3 className="font-semibold text-white mb-2" style={{ fontSize: 17 }}>{title}</h3>
                  <p className="text-white/45" style={{ fontSize: 15, lineHeight: 1.6 }}>{desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Team */}
          <div>
            <p className="text-[11px] font-semibold tracking-[0.22em] uppercase text-[#c9a15a] mb-3">
              The Team
            </p>
            <h2 className="font-extrabold text-white mb-8" style={{ fontSize: 22 }}>
              People behind Rakhwali PK
            </h2>
            <div className="grid grid-cols-4 gap-4">
              {team.map(({ name, role, initials }) => (
                <div key={name} className="flex flex-col items-center text-center gap-2">
                  <div
                    className="rounded-full bg-[#163d30] border-2 border-[#c9a15a]/30 flex items-center justify-center font-bold text-[#c9a15a]"
                    style={{ width: 100, height: 100, fontSize: 18 }}
                  >
                    {initials}
                  </div>
                  <div>
                    <p className="font-semibold text-white" style={{ fontSize: 16 }}>{name}</p>
                    <p className="text-white/40" style={{ fontSize: 14 }}>{role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="mt-auto border-t border-white/10 pt-10 text-center" style={{ minHeight: 180, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <h3 className="font-extrabold text-white mb-2" style={{ fontSize: 22 }}>
              Ready to transact with confidence?
            </h3>
            <p className="text-white/45 mb-7" style={{ fontSize: 15 }}>
              Create your free account in under 2 minutes.
            </p>
            <div>
              <Link
                href="/auth/register"
                className="inline-flex items-center font-medium text-[#0d2a1f] bg-[#D4AF37] hover:bg-[#c09c25] transition-colors"
                style={{ fontSize: 16, borderRadius: 40, paddingLeft: 32, paddingRight: 32, paddingTop: 12, paddingBottom: 12 }}
              >
                Get started free
              </Link>
            </div>
          </div>
        </div>
      </div>

      <FooterSection />
    </main>
  )
}
