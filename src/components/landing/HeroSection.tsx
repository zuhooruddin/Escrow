import { ArrowUpRight, Check, Scale, ShieldCheck, Sparkles } from 'lucide-react'
import { LANDING_HREF } from './navLinks'
import { Eyebrow, OutlineBtn, PrimaryBtn } from './ui'

type TimelineItemProps = {
  title: string
  sub: string
  time: string
  done?: boolean
  active?: boolean
}

const TimelineItem = ({ title, sub, time, done, active }: TimelineItemProps) => (
  <div className="flex items-start gap-3">
    <div className="mt-1">
      {done && <div className="w-5 h-5 rounded-full border-2 border-[#0d2a1f]/80 flex items-center justify-center"><Check className="w-3 h-3 text-[#0d2a1f]" strokeWidth={3} /></div>}
      {active && <div className="w-5 h-5 rounded-full bg-[#0d2a1f] flex items-center justify-center"><Check className="w-3 h-3 text-[#c9a15a]" strokeWidth={3} /></div>}
    </div>
    <div className="flex-1 flex items-start justify-between">
      <div>
        <div className="text-[13px] font-medium text-[#0d2a1f]">{title}</div>
        <div className="text-[11.5px] text-[#0d2a1f]/50 mt-0.5">{sub}</div>
      </div>
      <div className="text-[10px] text-[#0d2a1f]/50 tracking-wider">{time}</div>
    </div>
  </div>
)

const EscrowCard = () => (
  <div className="relative">
    {/* glow */}
    <div className="absolute -inset-6 bg-gradient-to-br from-[#c9a15a]/20 to-transparent blur-2xl rounded-[40px]" />

    <div className="relative bg-white rounded-2xl border border-[#0d2a1f]/5 shadow-xl p-6">
      
      {/* HEADER */}
      <div className="flex justify-between items-center pb-4 border-b border-[#0d2a1f]/10">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-[#0d2a1f] rounded flex items-center justify-center">
            <Sparkles className="w-3 h-3 text-[#c9a15a]" />
          </div>
          <span className="text-[12px] font-medium">Escrow activity</span>
        </div>

        <div className="flex items-center gap-1 text-[10px] border px-2 py-0.5 rounded-full">
          <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
          LIVE
        </div>
      </div>

      {/* AMOUNT */}
      <div className="py-5 flex justify-between items-end">
        <div>
          <h2 className="font-serif text-[32px]">
            Rs 15,000{" "}
            <span className="text-[#0d2a1f]/40 text-[20px]">(Locked)</span>
          </h2>
          <p className="text-[12px] text-[#0d2a1f]/50 mt-1">
            Deal in progress
          </p>
        </div>
      </div>

      {/* TIMELINE */}
      <div className="relative space-y-4">
        <div className="absolute left-[9px] top-2 bottom-2 w-[1px] bg-[#0d2a1f]/10" />

        <TimelineItem done title="Deal Created" sub="Buyer created deal" time="10:00 AM" />
        <TimelineItem done title="Seller Accepts" sub="Seller accepted" time="10:06 AM" />
        <TimelineItem done title="Funds locked" sub="Escrow holds funds" time="10:08 AM" />
        <TimelineItem done title="Work delivered" sub="Work uploaded" time="05:15 PM" />
        <TimelineItem active title="Released to seller" sub="Completed" time="05:45 PM" />
      </div>

      {/* FOOTER */}
      <div className="mt-5 bg-[#f0ebe3] border border-[#c9a15a]/30 rounded-lg p-3 text-[12px]">
        <strong>Fund unlocked:</strong> Funds released after approval.
      </div>

      <div className="flex justify-between mt-4 text-[11px] text-[#0d2a1f]/50">
        <span>Deal #71247</span>
        <ArrowUpRight className="w-4 h-4" />
      </div>
    </div>
  </div>
)

const HeroSection = () => (
  <section className="relative overflow-hidden">
    {/* background: dot texture + faded green/teal mesh (top-right) */}
    <div className="absolute inset-0 dotted-grid opacity-40" />
    <div className="mesh-hero-tr" aria-hidden />

    <div className="max-w-[1200px] mx-auto px-2 pt-10 pb-24 grid lg:grid-cols-2 gap-16 items-center">
      
      {/* LEFT CONTENT */}
      <div>
        <Eyebrow>Pakistan’s trusted escrow infrastructure</Eyebrow>

        <h1 className="font-serif mt-6 text-[64px] leading-[1.05] tracking-[-0.02em] text-[#0d2a1f]">
          Work, ship,get paid without{" "}
          <span className=" text-[#b88a3e] relative">
            losing sleep
            <span className="absolute left-0 -bottom-1 w-full h-[3px] bg-[#c9a15a]/70 rounded-full" />
          </span>.
        </h1>

        <p className="mt-6 text-[16px] leading-[1.7] text-[#0d2a1f]/70 max-w-[520px]">
          Rakhwali pk locks the buyer’s funds securely in an audited account until
          your work is delivered and approved. No more chasing payments. Just
          clean, fair, end-to-end backed transactions.
        </p>

        <div className="mt-8 flex gap-4">
          <PrimaryBtn href={LANDING_HREF.register} className="px-6 py-3 text-[15px]">
            Start your first deal
          </PrimaryBtn>
          <OutlineBtn href={LANDING_HREF.process} className="px-6 py-3 text-[15px]">
            See how it works
          </OutlineBtn>
        </div>

        {/* Features */}
        <div className="mt-10 flex flex-wrap gap-6 text-[13px] text-[#0d2a1f]/70">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4" strokeWidth={3} /> Free to register
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4" /> Secure & encrypted
          </div>
          <div className="flex items-center gap-2">
            <Scale className="w-4 h-4 text-[#c9a15a]" /> Dispute protection
          </div>
        </div>
      </div>

      {/* RIGHT CARD */}
      <EscrowCard />
    </div>
  </section>
)

export default HeroSection
