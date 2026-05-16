"use client";

import { ArrowRight, HandCoins, Lock, Send, UserRound } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { LandingEyebrowPill } from "./landingPrimitives";

type Step = {
  n: number;
  icon: LucideIcon;
  title: string;
  body: string;
  filled?: boolean;
};

const STEPS: Step[] = [
  {
    n: 1,
    icon: UserRound,
    title: "Create the deal",
    body: "Buyer defines terms, scope, milestones & deliverables. Seller reviews and accepts.",
    filled: false,
  },
  {
    n: 2,
    icon: HandCoins,
    title: "Seller accepts",
    body: "Both parties agree to the terms. Funds are required to be locked before starting.",
    filled: true,
  },
  {
    n: 3,
    icon: Lock,
    title: "Funds locked",
    body: "Buyer deposits the funds. Rakhwali pk holds it in a segregated escrow account.",
    filled: true,
  },
  {
    n: 4,
    icon: Send,
    title: "Approve & release",
    body: "Approve payment — payment is released to the seller. Safe, fair and fast for trust.",
    filled: false,
  },
];

function StepCard({ step, isLast }: { step: Step; isLast: boolean }) {
  const Icon = step.icon;

  return (
    <div className="relative min-w-0 flex-1">
      <div
        className={cn(
          "h-full rounded-2xl border border-[#0d2a1f]/8 bg-white p-6 pb-6 pt-6 shadow-[0_1px_0_rgba(13,42,31,0.04),0_4px_16px_-6px_rgba(13,42,31,0.1)]",
          "px-[22px]",
        )}
      >
        <div className="mb-5 flex items-center justify-between">
          <div
            className={cn(
              "flex h-11 w-11 shrink-0 items-center justify-center rounded-full border",
              step.filled
                ? "border-[#0d2a1f] bg-[#0d2a1f] text-[#c9a15a]"
                : "border-[#d6e2d8] bg-[#eef5ef] text-[#2f5c44]",
            )}
          >
            <Icon size={18} strokeWidth={1.8} className="shrink-0" />
          </div>
          <span className="font-landing text-xs tracking-[0.12em] text-[#0d2a1f]/35">
            0{step.n}
          </span>
        </div>

        <h3 className="mb-2 font-serif text-[19px] font-semibold leading-tight tracking-tight text-[#0d2a1f]">
          {step.title}
        </h3>

        <p className="font-landing m-0 text-[13px] leading-relaxed text-[#0d2a1f]/55">
          {step.body}
        </p>
      </div>

      {!isLast && (
        <div className="absolute -right-[18px] top-1/2 z-10 hidden -translate-y-1/2 lg:flex">
          <div className="flex h-9 w-9 items-center justify-center rounded-full border border-[#0d2a1f]/10 bg-section">
            <ArrowRight size={14} className="text-[#0d2a1f]/50" strokeWidth={1.8} />
          </div>
        </div>
      )}
    </div>
  );
}

export default function ProcessSection() {
  return (
    <section
      id="process"
      className="font-landing scroll-mt-24 border-t border-[#0d2a1f]/6 bg-page"
    >
      <div className="mx-auto max-w-[1280px] px-5 py-12 sm:px-8 sm:py-16 lg:px-8 lg:py-20">
        <div className="text-center">
          <LandingEyebrowPill>The process</LandingEyebrowPill>

          <h2 className="mt-5 font-serif text-[clamp(40px,5vw,54px)] font-semibold leading-[1.05] tracking-tight text-[#0d2a1f]">
            Zero ambiguity
          </h2>

          <p className="mx-auto mt-4 max-w-[520px] text-[14.5px] leading-[1.65] text-[#0d2a1f]/58">
            Every deal flows through a clear, four-step escrow process — so
            you and your counterparty know exactly where the money is and what
            happens next.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-5 sm:mt-14 md:grid-cols-2 md:gap-6 lg:mt-14 lg:grid-cols-4 lg:gap-10">
          {STEPS.map((step, i) => (
            <StepCard key={step.n} step={step} isLast={i === STEPS.length - 1} />
          ))}
        </div>
      </div>
    </section>
  );
}
