/** App routes + in-page anchors. Hash targets must match section `id`s on the landing page. */
export const LANDING_HREF = {
  home: '/',
  login: '/auth/login',
  register: '/auth/register',
  process: '#process',
  why: '#why',
  useCases: '#use',
  pricing: '#pricing',
  support: '#support',
  cta: '#cta',
} as const

export const LANDING_NAV_ITEMS = [
  { label: 'How it works', href: LANDING_HREF.process },
  { label: 'Why us', href: LANDING_HREF.why },
  { label: 'Use Cases', href: LANDING_HREF.useCases },
  { label: 'Pricing', href: LANDING_HREF.pricing },
  { label: 'Support', href: LANDING_HREF.support },
] as const
