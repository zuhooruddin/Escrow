"use client";

import { ArrowRight, CircleCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { LandingEyebrowPill } from "./landingPrimitives";

function CheckRow({ children }: { children: React.ReactNode }) {
  return (
    <div className="font-landing flex items-center gap-2 text-[12.5px] text-[#0d2a1f]/75">
      <CircleCheck size={15} className="shrink-0 text-[#0d2a1f]" strokeWidth={1.8} />
      {children}
    </div>
  );
}

function CardLabel({
  children,
  gold,
}: {
  children: React.ReactNode;
  gold?: boolean;
}) {
  return (
    <div
      className={cn(
        "font-landing text-[9.5px] font-semibold uppercase tracking-[0.2em]",
        gold ? "text-[#c9a15a]" : "text-[#0d2a1f]/45",
      )}
    >
      {children}
    </div>
  );
}

function PricingGoldButton({ children }: { children: React.ReactNode }) {
  return (
    <button
      type="button"
      className="font-landing inline-flex cursor-pointer items-center gap-2 rounded-[10px] border-0 bg-gradient-to-b from-[#d4b07a] to-[#c9a15a] px-[18px] py-2.5 text-[13.5px] font-medium text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_4px_10px_rgba(201,161,90,0.25)] transition-[filter,transform] hover:brightness-[1.06] hover:-translate-y-px"
    >
      {children}
      <ArrowRight size={13} strokeWidth={2} />
    </button>
  );
}

export default function PricingSection() {
  return (
    <section
      id="pricing"
      className="font-landing relative scroll-mt-24 overflow-hidden bg-section"
    >
      <div
        className="pointer-events-none absolute bottom-0 left-0 h-[260px] w-[260px] opacity-[0.18]"
        aria-hidden
      >
        <svg viewBox="0 0 200 220" width="100%" height="100%" className="text-[#0d2a1f]">
          <path
            fill="currentColor"
            d="M20,180 C30,100 100,60 180,90 L180,220 L10,220 Z"
          />
        </svg>
      </div>

      <div
        className="pointer-events-none absolute left-[52px] top-11 flex h-[42px] w-[42px] items-center justify-center rounded-[10px] bg-[#0d2a1f] opacity-[0.85]"
        aria-hidden
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <path
            d="M12 2L4 6v6c0 5.25 3.5 10.15 8 11.35C16.5 22.15 20 17.25 20 12V6L12 2z"
            fill="#c9a15a"
            opacity="0.3"
          />
          <path
            d="M12 2L4 6v6c0 5.25 3.5 10.15 8 11.35C16.5 22.15 20 17.25 20 12V6L12 2z"
            stroke="#c9a15a"
            strokeWidth="1.5"
            fill="none"
          />
          <path
            d="M9 12l2 2 4-4"
            stroke="#c9a15a"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      <div className="relative mx-auto max-w-[1180px] px-5 py-14 text-center sm:px-8 sm:py-[72px]">
        <LandingEyebrowPill>Pricing</LandingEyebrowPill>

        <h2 className="mt-[18px] font-serif text-[clamp(36px,4vw,50px)] font-semibold leading-[1.07] tracking-tight text-[#0d2a1f]">
          You only pay when a{" "}
          <span className=" text-[#2d6e48]">deal completes</span>.
        </h2>

        <p className="mx-auto mt-3 max-w-[520px] text-sm leading-[1.65] text-[#0d2a1f]/58">
          Transparent fee of 2% on the released amount. Dedicated to high
          volume users.
        </p>

        <div className="mx-auto mt-10 grid max-w-[1020px] grid-cols-1 gap-4 text-left sm:mt-10 md:grid-cols-[1.45fr_1fr_1fr] md:gap-4">
          <div className="rounded-[18px] border border-[#c9a15a]/38 bg-[#f5f2ea] px-6 py-5 sm:px-6">
            <CardLabel>Standard plan</CardLabel>
            <div className="mb-5 mt-4 flex items-baseline gap-3.5">
              <span className="font-serif text-[58px] font-semibold leading-none tracking-[-0.03em] text-[#0d2a1f]">
                2%
              </span>
              <span className="max-w-[180px] text-xs leading-normal text-[#0d2a1f]/55">
                Deducted automatically from the disbursement before release.
              </span>
            </div>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-x-4 sm:gap-y-2">
              <CheckRow>Free registration &amp; deal creation</CheckRow>
              <CheckRow>No monthly subscription fees</CheckRow>
              <CheckRow>Change escrow &amp; release</CheckRow>
              <CheckRow>Dispute panel scoring</CheckRow>
            </div>
          </div>

          <div className="flex flex-col rounded-[18px] border border-[#0d2a1f]/10 bg-white px-5 py-5 sm:px-[22px]">
            <CardLabel>Custom plans</CardLabel>
            <div className="mt-3.5 flex-1 font-serif text-[22px] font-medium leading-snug text-[#0d2a1f]">
              Custom rates for
              <br />
              high volume merchants.
            </div>
            <div className="mt-6">
              <a
                href="#"
                className="font-landing inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#0d2a1f] no-underline"
              >
                Talk &amp; rates
                <ArrowRight size={12} strokeWidth={2.2} />
              </a>
            </div>
          </div>

          <div className="flex flex-col rounded-[18px] bg-[#0d2a1f] px-5 py-5 sm:px-[22px]">
            <CardLabel gold>Need help?</CardLabel>
            <div className="mt-3.5 flex-1 font-serif text-[22px] font-medium leading-snug text-white">
              Stuck on your first deal?
            </div>
            <div className="mt-6">
              <PricingGoldButton>Need help</PricingGoldButton>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
