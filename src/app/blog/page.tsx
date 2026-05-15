import Link from 'next/link'
import NavSection from '@/components/landing/NavSection'
import FooterSection from '@/components/landing/FooterSection'

export const metadata = { title: 'Blog — EscrowPK' }

const posts = [
  {
    slug:     'how-escrow-protects-freelancers',
    tag:      'Freelancers',
    title:    'How Escrow Protects Pakistani Freelancers from Non-Payment',
    excerpt:  'Discover how escrow eliminates the fear of working with new clients — get paid every time, guaranteed.',
    date:     'May 10, 2025',
    readTime: '5 min read',
  },
  {
    slug:     'buying-used-cars-safely',
    tag:      'Buyers Guide',
    title:    'Buying a Used Car Online in Pakistan? Use Escrow.',
    excerpt:  'Vehicle fraud is rampant in online marketplaces. Here\'s how to make sure your payment is protected until the car is in your hands.',
    date:     'April 28, 2025',
    readTime: '4 min read',
  },
  {
    slug:     'ibft-vs-card-payments',
    tag:      'Payments',
    title:    'IBFT vs Card Payments: What Works Best for Escrow in Pakistan?',
    excerpt:  'A deep dive into Pakistan\'s payment landscape and why bank transfers remain the most reliable method for escrow transactions.',
    date:     'April 14, 2025',
    readTime: '6 min read',
  },
  {
    slug:     'dispute-resolution-guide',
    tag:      'Platform',
    title:    'Understanding EscrowPK\'s Dispute Resolution Process',
    excerpt:  'What happens when buyer and seller disagree? Walk through our step-by-step dispute resolution process and how we ensure fairness.',
    date:     'March 30, 2025',
    readTime: '7 min read',
  },
  {
    slug:     'kyc-why-it-matters',
    tag:      'Security',
    title:    'Why KYC Verification Makes Every Transaction Safer',
    excerpt:  'Identity verification isn\'t just a legal requirement — it\'s what separates trustworthy platforms from risky ones.',
    date:     'March 15, 2025',
    readTime: '4 min read',
  },
  {
    slug:     'escrow-for-businesses',
    tag:      'Business',
    title:    'How Pakistani Businesses Use Escrow for B2B Transactions',
    excerpt:  'From supplier payments to project milestones — escrow is becoming the go-to tool for businesses transacting at scale.',
    date:     'March 1, 2025',
    readTime: '5 min read',
  },
]

const tagColors: Record<string, string> = {
  'Freelancers':   'bg-emerald-50 text-emerald-700',
  'Buyers Guide':  'bg-blue-50 text-blue-700',
  'Payments':      'bg-amber-50 text-amber-700',
  'Platform':      'bg-purple-50 text-purple-700',
  'Security':      'bg-red-50 text-red-700',
  'Business':      'bg-gray-100 text-gray-700',
}

export default function BlogPage() {
  return (
    <main className="min-h-screen bg-page">
      <NavSection />

      {/* Header */}
      <section className="bg-[#071a14] text-white pt-24 pb-16 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-[11px] font-semibold tracking-[0.2em] text-[#c9a15a] uppercase mb-4">EscrowPK Blog</p>
          <h1 className="font-bold text-4xl sm:text-5xl tracking-tight mb-5">
            Insights & Guides
          </h1>
          <p className="text-white/60 text-lg leading-relaxed">
            Practical advice on safe online transactions, platform updates, and everything escrow in Pakistan.
          </p>
        </div>
      </section>

      {/* Posts grid */}
      <section className="py-16 px-6">
        <div className="max-w-5xl mx-auto">
          {/* Featured */}
          <div className="mb-10">
            <Link href={`/blog/${posts[0].slug}`}
              className="block bg-white rounded-2xl border border-[#e0ddd4] overflow-hidden hover:shadow-lg transition-shadow group">
              <div className="h-52 bg-gradient-to-br from-[#071a14] to-[#153d30] flex items-center justify-center px-10">
                <p className="text-white/20 text-6xl font-black text-center leading-none">{posts[0].title.slice(0,2)}</p>
              </div>
              <div className="p-7">
                <div className="flex items-center gap-3 mb-3">
                  <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${tagColors[posts[0].tag]}`}>{posts[0].tag}</span>
                  <span className="text-xs text-gray-400">{posts[0].date} · {posts[0].readTime}</span>
                </div>
                <h2 className="text-xl font-bold text-[#0d2a1f] group-hover:text-[#153d30] transition-colors mb-2 leading-snug">{posts[0].title}</h2>
                <p className="text-sm text-gray-600 leading-relaxed">{posts[0].excerpt}</p>
              </div>
            </Link>
          </div>

          {/* Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.slice(1).map(post => (
              <Link key={post.slug} href={`/blog/${post.slug}`}
                className="block bg-white rounded-2xl border border-[#e0ddd4] p-6 hover:shadow-md transition-shadow group">
                <div className="flex items-center gap-2 mb-3">
                  <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${tagColors[post.tag] || 'bg-gray-100 text-gray-600'}`}>{post.tag}</span>
                </div>
                <h3 className="text-sm font-bold text-[#0d2a1f] group-hover:text-[#153d30] transition-colors mb-2 leading-snug">{post.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed mb-4 line-clamp-3">{post.excerpt}</p>
                <p className="text-xs text-gray-400">{post.date} · {post.readTime}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-16 px-6 bg-[#f5f3ee]">
        <div className="max-w-xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-[#0d2a1f] mb-2">Stay in the loop</h2>
          <p className="text-sm text-gray-600 mb-6">Get new articles and platform updates delivered to your inbox.</p>
          <div className="flex gap-2">
            <input
              type="email"
              placeholder="you@example.com"
              className="flex-1 h-11 px-4 text-sm bg-white border border-[#e0ddd4] rounded-xl outline-none focus:border-[#0d2a1f] transition-colors"
            />
            <button className="h-11 px-5 text-sm font-bold text-white bg-[#0d2a1f] hover:bg-[#153d30] rounded-xl transition-colors">
              Subscribe
            </button>
          </div>
        </div>
      </section>

      <FooterSection />
    </main>
  )
}
