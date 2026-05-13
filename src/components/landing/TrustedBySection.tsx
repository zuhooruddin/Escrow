const TrustedBySection = () => (
  <section className="border-t border-[#0d2a1f]/10 bg-[#ece5d5]/50">
    <div className="max-w-[1280px] mx-auto px-8 py-10">
      <div className="text-center text-[13px] text-[#0d2a1f]/70 mb-6">Trusted by businesses across Pakistan</div>
      <div className="flex flex-wrap items-center justify-between gap-x-10 gap-y-6 opacity-80">
        {['Daraz', 'Careem', 'HBL', 'Jazz', 'eBooks', 'Nayapay', 'TCS', 'sympl', 'fiverr.', 'upwork'].map((brand) => (
          <span key={brand} className="font-serif text-[22px] text-[#0d2a1f]/70 tracking-tight">{brand}</span>
        ))}
      </div>
    </div>
  </section>
)

export default TrustedBySection
