import { Sparkles } from 'lucide-react'
import { LANDING_HREF } from './navLinks'
import { GoldBtn } from './ui'

const BigCTASection = () => (
  <section id="cta" className="scroll-mt-24 bg-forest text-[#e8f0ec] relative overflow-hidden">
    <div className="absolute right-10 top-10 opacity-60">
      <Sparkles className="w-8 h-8 text-[#c9a15a]" />
    </div>
    <div className="max-w-[1280px] mx-auto px-8 py-20 text-center relative">
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#c9a15a]/35 bg-forest-surface/80 text-[#c9a15a] mb-6">
        <span className="eyebrow">Start now</span>
      </div>
      <h2 className="font-serif text-[54px] leading-[1.05] tracking-tight text-white">Start securing your deals with trust.</h2>
      <div className="mt-8 flex justify-center">
        <GoldBtn href={LANDING_HREF.register}>Create your account</GoldBtn>
      </div>
    </div>
  </section>
)

export default BigCTASection
