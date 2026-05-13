import Link from 'next/link'
import { LANDING_HREF } from './navLinks'
import { Logo } from './ui'

const footerLinkClass =
  'text-inherit no-underline transition-colors hover:text-[#e8dfc9] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c9a15a]/60'

const footerAppLinkClass = `${footerLinkClass} inline-block`

const FooterSection = () => (
  <footer id="support" className="bg-forest-deep text-[#9fb0a7] border-t border-white/5 scroll-mt-20">
    <div className="max-w-[1280px] mx-auto px-8 py-12 grid grid-cols-2 md:grid-cols-4 gap-8 text-[13px]">
      <div className="col-span-2 md:col-span-1">
        <Link href={LANDING_HREF.home} className={footerLinkClass}>
          <Logo className="[&_span]:text-[#e8dfc9]" />
        </Link>
        <div className="mt-3 text-[11.5px] leading-relaxed opacity-70">Configure, create, trade with trust.<br />Safe. Fair. Simple. Instant infrastructure.<br /><br />&copy; 2025 Escrowpk Contributors, Pvt. Ltd.</div>
      </div>
      <div>
        <div className="eyebrow text-[#c9a15a] mb-3">Product</div>
        <ul className="space-y-2">
          <li><a href={LANDING_HREF.process} className={footerLinkClass}>How it works</a></li>
          <li><a href={LANDING_HREF.pricing} className={footerLinkClass}>Pricing</a></li>
          <li><a href={LANDING_HREF.useCases} className={footerLinkClass}>For sellers</a></li>
          <li><Link href={LANDING_HREF.register} className={footerAppLinkClass}>Create account</Link></li>
        </ul>
      </div>
      <div>
        <div className="eyebrow text-[#c9a15a] mb-3">Company</div>
        <ul className="space-y-2">
          <li><a href="#" className={footerLinkClass}>About</a></li>
          <li><a href="#" className={footerLinkClass}>Blog</a></li>
          <li><a href={LANDING_HREF.support} className={footerLinkClass}>Contact</a></li>
          <li><Link href={LANDING_HREF.login} className={footerAppLinkClass}>Sign in</Link></li>
          <li><Link href={LANDING_HREF.register} className={footerAppLinkClass}>Sign up</Link></li>
        </ul>
      </div>
      <div>
        <div className="eyebrow text-[#c9a15a] mb-3">Legal</div>
        <ul className="space-y-2">
          <li><a href="#" className={footerLinkClass}>Terms of Service</a></li>
          <li><a href="#" className={footerLinkClass}>Privacy</a></li>
        </ul>
      </div>
    </div>
  </footer>
)

export default FooterSection
