import { ArrowRight } from 'lucide-react'
import Link from 'next/link'
import type { ReactNode } from 'react'

function isAppPath(href: string) {
  return href.startsWith('/') && !href.startsWith('//')
}

type LogoProps = {
  className?: string
}

type ButtonProps = {
  children: ReactNode
  className?: string
  href?: string
}

type EyebrowProps = {
  children: ReactNode
  dark?: boolean
}

export const Logo = ({ className = '' }: LogoProps) => (
  <div className={`flex items-center ${className}`}>
    <img src="/logo.webp" alt="Rakhwali PK" className="h-9 w-auto object-contain" />
  </div>
)

export const Eyebrow = ({ children, dark = false }: EyebrowProps) => (
  <div
    className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border ${
      dark
        ? 'border-[#c9a15a]/40 bg-[#0d2a1f] text-[#e8dfc9]'
        : 'border-[#0d2a1f]/15 bg-[#f4efe6]/60 text-[#0d2a1f]'
    }`}
  >
    <span className={`text-[10px] ${dark ? 'text-[#c9a15a]' : 'text-[#0d2a1f]/60'}`}>+</span>
    <span className="eyebrow">{children}</span>
  </div>
)

export const PrimaryBtn = ({ children, className = '', href }: ButtonProps) => {
  const classes = `group inline-flex items-center justify-between gap-3 bg-[#0d2a1f] hover:bg-[#12382a] text-[#f4efe6] pl-5 pr-2 py-2 rounded-full text-[14px] font-medium transition-colors ${className}`
  const inner = (
    <>
      <span>{children}</span>
      <span className="w-7 h-7 rounded-full bg-[#1a4030] flex items-center justify-center">
        <ArrowRight className="w-3.5 h-3.5" />
      </span>
    </>
  )
  if (href) {
    if (isAppPath(href)) {
      return (
        <Link href={href} className={classes}>
          {inner}
        </Link>
      )
    }
    return (
      <a href={href} className={classes}>
        {inner}
      </a>
    )
  }
  return <button type="button" className={classes}>{inner}</button>
}

export const GoldBtn = ({ children, className = '', href }: ButtonProps) => {
  const classes = `inline-flex items-center gap-2 bg-gradient-to-b from-[#d4b06e] to-[#b88a3e] text-[#0d2a1f] px-4 py-2 rounded-full text-[13px] font-semibold shadow-[inset_0_1px_0_rgba(255,255,255,0.35)] hover:brightness-105 transition ${className}`
  const inner = (
    <>
      <span>{children}</span>
      <ArrowRight className="w-3.5 h-3.5" />
    </>
  )
  if (href) {
    if (isAppPath(href)) {
      return (
        <Link href={href} className={classes}>
          {inner}
        </Link>
      )
    }
    return (
      <a href={href} className={classes}>
        {inner}
      </a>
    )
  }
  return (
    <button type="button" className={classes}>
      {inner}
    </button>
  )
}

export const OutlineBtn = ({ children, className = '', href }: ButtonProps) => {
  const classes = `inline-flex items-center gap-2 border border-[#0d2a1f]/15 bg-white/50 text-[#0d2a1f] px-5 py-2 rounded-full text-[14px] font-medium hover:bg-white transition ${className}`
  const inner = (
    <>
      <span>{children}</span>
      <span className="w-5 h-5 rounded-full border border-[#0d2a1f]/30 flex items-center justify-center">
        <ArrowRight className="w-3 h-3" />
      </span>
    </>
  )
  if (href) {
    if (isAppPath(href)) {
      return (
        <Link href={href} className={classes}>
          {inner}
        </Link>
      )
    }
    return (
      <a href={href} className={classes}>
        {inner}
      </a>
    )
  }
  return <button type="button" className={classes}>{inner}</button>
}
