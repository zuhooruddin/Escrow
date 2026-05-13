"use client";

import { Code2, Globe, Monitor, ShoppingBag } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { LandingEyebrowPill } from "./landingPrimitives";

type UseCaseCardProps = {
  icon: LucideIcon;
  title: string;
  body: string;
};

function UseCaseCard({ icon: Icon, title, body }: UseCaseCardProps) {
  return (
    <div className="flex items-start gap-[18px] rounded-2xl border border-[#0d2a1f]/9 bg-white p-5 shadow-[0_1px_3px_rgba(13,42,31,0.04),0_4px_12px_-6px_rgba(13,42,31,0.08)]">
      <div className="flex h-[54px] w-[54px] shrink-0 items-center justify-center rounded-[14px] border border-[#0d2a1f]/7 bg-[#eaf0eb]">
        <Icon size={22} className="text-[#0d2a1f]" strokeWidth={1.6} />
      </div>
      <div>
        <div className="font-landing mb-1 text-[14.5px] font-semibold text-[#0d2a1f]">
          {title}
        </div>
        <div className="font-landing max-w-[260px] text-[12.5px] leading-[1.58] text-[#0d2a1f]/55">
          {body}
        </div>
      </div>
    </div>
  );
}

export default function UseCasesSection() {
  return (
    <section
      id="use"
      className="font-landing relative scroll-mt-24 overflow-hidden border-t border-[#0d2a1f]/7 bg-section"
    >
      <div className="mesh-trust-bl pointer-events-none absolute inset-0" aria-hidden />

      <div className="relative mx-auto grid max-w-[1280px] grid-cols-1 items-start gap-10 px-5 py-14 sm:px-8 md:gap-14 lg:grid-cols-[0.85fr_1.5fr] lg:gap-14 lg:px-12 lg:py-[72px]">
        <div>
          <div className="mb-9 flex justify-center lg:mb-9 lg:justify-start">
            <LandingEyebrowPill>Use cases</LandingEyebrowPill>
          </div>

          <h2 className="m-0 font-serif text-[clamp(38px,4vw,50px)] font-semibold leading-[1.08] tracking-tight text-[#0d2a1f]">
            Anything
            <br />
            where
            <br />
            <span className=" text-[#2d6e48]">trust</span> is
            <br />
            the bottleneck.
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-4">
          <UseCaseCard
            icon={Code2}
            title="Freelance services"
            body="Fiverr, design, coding, SEO & writing work across Pakistan. Pay safely once work ends."
          />
          <UseCaseCard
            icon={Monitor}
            title="Digital products"
            body="Apps, software, ebooks, courses — escrow secure for virtual & digital products."
          />
          <UseCaseCard
            icon={Globe}
            title="Domains & websites"
            body="Safe handover of domains, blogs & stores, and other digital assets."
          />
          <UseCaseCard
            icon={ShoppingBag}
            title="Physical goods"
            body="Buy & sell products with confidence across Pakistan."
          />
        </div>
      </div>
    </section>
  );
}
