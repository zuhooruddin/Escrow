import Link from 'next/link'
import { LANDING_HREF } from './navLinks'
import { Logo } from './ui'

const link =
  'block text-[#B1B1A5] no-underline transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c9a15a]/60'

const FooterSection = () => (
  <footer
    id="support"
    className="relative border-t border-white/5 scroll-mt-20 font-['Inter',sans-serif]"
    style={{ background: '#1A231F' }}
  >
    <div className="max-w-[1200px] mx-auto px-10 pt-14 pb-10 grid grid-cols-2 md:grid-cols-4 gap-10">

      {/* Brand */}
      <div className="col-span-2 md:col-span-1">
        <Link href={LANDING_HREF.home} className="opacity-90 hover:opacity-100 transition-opacity">
          <Logo className="[&_span]:text-[#E0DCCA] [&_span]:text-xl" />
        </Link>
        <p className="mt-3 leading-relaxed" style={{ fontSize: 14, color: '#B1B1A5' }}>
          Configure, create, trade with trust.<br />
          Safe. Fair. Simple. Instant infrastructure.
        </p>
        <p className="mt-5 uppercase tracking-widest" style={{ fontSize: 12, color: '#B1B1A5', opacity: 0.5 }}>
          &copy; 2025 Escrowpk Contributors Pvt. Ltd.
        </p>
      </div>

      {/* Product */}
      <div>
        <p className="font-semibold uppercase tracking-widest mb-4 text-[#c9a15a]" style={{ fontSize: 11 }}>
          Product
        </p>
        <ul>
          {[
            { label: 'How it works',   href: LANDING_HREF.process,  external: true },
            { label: 'Pricing',        href: LANDING_HREF.pricing,  external: true },
            { label: 'For sellers',    href: LANDING_HREF.useCases, external: true },
            { label: 'Create account', href: LANDING_HREF.register, external: false },
          ].map(({ label, href, external }) => (
            <li key={label} style={{ lineHeight: 2.0 }}>
              {external
                ? <a href={href} className={link} style={{ fontSize: 15, fontWeight: 500 }}>{label}</a>
                : <Link href={href} className={link} style={{ fontSize: 15, fontWeight: 500 }}>{label}</Link>
              }
            </li>
          ))}
        </ul>
      </div>

      {/* Company */}
      <div>
        <p className="font-semibold uppercase tracking-widest mb-4 text-[#c9a15a]" style={{ fontSize: 11 }}>
          Company
        </p>
        <ul>
          {[
            { label: 'About',   href: '/about' },
            { label: 'Blog',    href: '/blog' },
            { label: 'Contact', href: '/contact' },
            { label: 'Sign in', href: LANDING_HREF.login },
            { label: 'Sign up', href: LANDING_HREF.register },
          ].map(({ label, href }) => (
            <li key={label} style={{ lineHeight: 2.0 }}>
              <Link href={href} className={link} style={{ fontSize: 15, fontWeight: 500 }}>{label}</Link>
            </li>
          ))}
        </ul>
      </div>

      {/* Legal */}
      <div>
        <p className="font-semibold uppercase tracking-widest mb-4 text-[#c9a15a]" style={{ fontSize: 11 }}>
          Legal
        </p>
        <ul>
          {[
            { label: 'Terms of Service', href: '/terms' },
            { label: 'Privacy',          href: '/privacy' },
          ].map(({ label, href }) => (
            <li key={label} style={{ lineHeight: 2.0 }}>
              <Link href={href} className={link} style={{ fontSize: 15, fontWeight: 500 }}>{label}</Link>
            </li>
          ))}
        </ul>
      </div>
    </div>

    {/* Star icon — far right */}
    <div className="absolute bottom-8 right-10 select-none" style={{ color: '#c9a15a', opacity: 0.25 }} aria-hidden>
      <svg width="32" height="32" viewBox="0 0 32 32" fill="currentColor">
        <path d="M16 0 L17.5 14.5 L32 16 L17.5 17.5 L16 32 L14.5 17.5 L0 16 L14.5 14.5 Z" />
      </svg>
    </div>
  </footer>
)

export default FooterSection
