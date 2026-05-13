"use client";

import { Building2, FileCheck2, Scale, ShieldCheck, Star } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { LandingEyebrowPill } from "./landingPrimitives";

type FeatureTileProps = {
  icon: LucideIcon;
  title: string;
  body: string;
  highlighted?: boolean;
};

function FeatureTile({ icon: Icon, title, body, highlighted }: FeatureTileProps) {
  return (
    <div
      className={cn(
        "rounded-[14px] p-5 px-[18px] pt-5",
        highlighted
          ? "border border-[#c9a15a]/35 bg-[#f5f2ea]"
          : "border border-[#0d2a1f]/10 bg-white",
      )}
    >
      <div className="mb-3.5 flex h-9 w-9 items-center justify-center rounded-full border border-[#0d2a1f]/10 bg-[#f0ebe3]">
        <Icon size={15} className="text-[#0d2a1f]" strokeWidth={1.8} />
      </div>
      <div className="font-landing mb-1 text-[13.5px] font-semibold text-[#0d2a1f]">
        {title}
      </div>
      <div className="font-landing text-xs leading-[1.55] text-[#0d2a1f]/55">
        {body}
      </div>
    </div>
  );
}

type TestimonialCardProps = {
  dark?: boolean;
  quote: string;
  name: string;
  role: string;
  initials: string;
};

function TestimonialCard({ dark, quote, name, role, initials }: TestimonialCardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl p-5",
        dark
          ? "bg-[#0d2a1f] shadow-[0_8px_24px_-8px_rgba(13,42,31,0.4)]"
          : "border border-[#0d2a1f]/6 bg-[#f0ebe3] shadow-[0_2px_8px_-4px_rgba(13,42,31,0.08)]",
      )}
    >
      <div className="mb-3 flex gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            size={13}
            className={cn(dark ? "fill-[#c9a15a] text-[#c9a15a]" : "fill-[#b88a3e] text-[#b88a3e]")}
          />
        ))}
      </div>
      <p
        className={cn(
          "font-landing mb-4 text-[13px] leading-relaxed",
          dark ? "text-[#e8dfc9]" : "text-[#0d2a1f]/80",
        )}
      >
        &ldquo;{quote}&rdquo;
      </p>
      <div className="flex items-center gap-2.5">
        <div
          className={cn(
            "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[10.5px] font-bold",
            dark ? "bg-[#c9a15a] text-[#0d2a1f]" : "bg-[#0d2a1f] text-[#f4efe6]",
          )}
        >
          {initials}
        </div>
        <div>
          <div
            className={cn(
              "font-landing text-[12.5px] font-semibold",
              dark ? "text-white" : "text-[#0d2a1f]",
            )}
          >
            {name}
          </div>
          <div
            className={cn(
              "font-landing mt-px text-[11px]",
              dark ? "text-[#c9a15a]" : "text-[#0d2a1f]/45",
            )}
          >
            {role}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function BuiltForSection() {
  return (
    <section id="why" className="font-landing scroll-mt-24 bg-section">
      <div className="mx-auto grid max-w-[1280px] grid-cols-1 gap-12 px-5 py-12 md:gap-16 md:px-8 md:py-16 lg:grid-cols-2 lg:gap-16 lg:px-12 lg:py-20">
        <div>
          <LandingEyebrowPill>Built economy</LandingEyebrowPill>

          <h2 className="mt-[18px] font-serif text-[clamp(34px,3.5vw,46px)] font-semibold leading-[1.08] tracking-tight text-[#0d2a1f]">
            Built specifically for
            <br />
            Pakistan&apos;s digital economy.
          </h2>

          <p className="mt-3.5 max-w-[380px] text-[13.5px] leading-[1.65] text-[#0d2a1f]/58">
            Whether you&apos;re a creator, freelancer, gamer, or a digital
            commerce merchant — Escrowpk works with your local economy.
          </p>

          <div className="mt-7 grid grid-cols-2 gap-3.5">
            <FeatureTile
              highlighted
              icon={Building2}
              title="Bank Integration"
              body="Direct bank integrations made for Pakistan."
            />
            <FeatureTile
              icon={Scale}
              title="Neutral dispute resolution"
              body="Money sits in segregated accounts we don't touch."
            />
            <FeatureTile
              icon={ShieldCheck}
              title="Secure funding"
              body="Handled human panels and resolve disputes rules."
            />
            <FeatureTile
              icon={FileCheck2}
              title="Audited, Segregated Accounts"
              body="Every action is logged and management is guaranteed."
            />
          </div>
        </div>

        <div>
          <LandingEyebrowPill>Voices from the deals</LandingEyebrowPill>

          <h3 className="mt-[18px] font-serif text-[clamp(26px,2.8vw,34px)] font-medium leading-[1.18] tracking-tight text-[#0d2a1f]">
            &ldquo;The first time I paid a stranger
            <br />
            online{" "}
           without{" "}
            losing sleep.&rdquo;
          </h3>

          <div className="mt-6 flex flex-col gap-3.5">
            <TestimonialCard
              quote="Finally a product I call best. Funds locked, work delivered, money released. Simple."
              name="Ahmed Khan"
              role="Founder, A customized dress"
              initials="AK"
            />
            <TestimonialCard
              dark
              quote="Stop Business disagree. I used to these invoices for traders. Now I get paid on lock, locked, locked, used Piqaz."
              name="Sam Ahsen"
              role="Facepack manager"
              initials="SA"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
