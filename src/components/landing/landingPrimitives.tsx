import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export function LandingEyebrowPill({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'font-landing inline-flex items-center gap-1.5 rounded-full border border-[#e0ddd4] bg-white/65 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-[#4f5f55] backdrop-blur-sm',
        className,
      )}
    >
      <span className="text-[11px] font-bold text-[#c9a15a]">+</span>
      {children}
    </span>
  );
}
