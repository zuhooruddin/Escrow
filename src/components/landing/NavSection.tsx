"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { LANDING_HREF, LANDING_NAV_ITEMS } from "./navLinks";

function AppOrHashLink({
  href,
  className,
  children,
}: {
  href: string;
  className: string;
  children: ReactNode;
}) {
  const isApp = href.startsWith("/") && !href.startsWith("//");
  if (isApp) {
    return (
      <Link href={href} className={className}>
        {children}
      </Link>
    );
  }
  return (
    <a href={href} className={className}>
      {children}
    </a>
  );
}

const navLinkClass =
  "font-landing text-[13.5px] text-[#0d2a1f]/65 no-underline transition-colors hover:text-[#0d2a1f]";

const navCtaClass =
  "font-landing inline-flex items-center gap-[7px] rounded-[9px] border-0 bg-gradient-to-b from-[#d4b07a] to-[#c9a15a] px-[18px] py-[9px] text-[13.5px] font-medium text-white no-underline shadow-[inset_0_1px_0_rgba(255,255,255,0.3),0_2px_8px_rgba(201,161,90,0.28)] transition-[filter,transform] hover:brightness-[1.06] hover:-translate-y-px";

export default function NavSection() {
  return (
    <header className="font-landing sticky top-0 z-50 border-b border-[#e0ddd4] bg-[rgba(249,249,247,0.92)] backdrop-blur-xl supports-[backdrop-filter]:bg-[rgba(249,249,247,0.88)]">
      <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between px-7">
        <Link href={LANDING_HREF.home} className="flex items-center gap-2.5 no-underline">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[7px] bg-[#0d2a1f]">
            <span className="text-[13px] font-semibold leading-none text-white">A</span>
          </div>
          <span className="text-[15px] font-medium tracking-tight text-[#0d2a1f]">Escrowpk</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {LANDING_NAV_ITEMS.map(({ label, href }) => (
            <AppOrHashLink key={label} href={href} className={navLinkClass}>
              {label}
            </AppOrHashLink>
          ))}
        </nav>

        <div className="flex items-center gap-5 md:gap-[22px]">
          <Link href={LANDING_HREF.login} className={navLinkClass}>
            Sign in
          </Link>
          <Link href={LANDING_HREF.register} className={navCtaClass}>
            Get Started
            <ArrowRight size={13} strokeWidth={2.2} />
          </Link>
        </div>
      </div>
    </header>
  );
}
