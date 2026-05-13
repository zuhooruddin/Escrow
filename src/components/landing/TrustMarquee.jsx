import { Fragment } from 'react';

const PARTNERS = [
  { src: '/alfalah.png', alt: 'Bank Alfalah' },
  { src: '/easypaisa.png', alt: 'Easypaisa' },
  { src: '/faysal-bank-logo.png', alt: 'Faysal Bank' },
  { src: '/hbl.png', alt: 'HBL' },
  { src: '/islami.png', alt: 'BankIslami Pakistan' },
  { src: '/jazz.png', alt: 'JazzCash' },
  { src: '/js.png', alt: 'JS Bank' },
  { src: '/meezan.png', alt: 'Meezan Bank' },
];

const Dot = () => (
  <span className="h-1 w-1 flex-shrink-0 rounded-full bg-ink/20" aria-hidden="true" />
);

const fadeMask =
  '[mask-image:linear-gradient(to_right,transparent_0%,black_8%,black_92%,transparent_100%)] [-webkit-mask-image:linear-gradient(to_right,transparent_0%,black_8%,black_92%,transparent_100%)]';

export default function TrustMarquee() {
  return (
    <section className="relative border-y border-ink/8 bg-ivory py-5">
      <div className={`mx-auto max-w-[1400px] overflow-hidden ${fadeMask}`}>
        <div className="flex w-max animate-[marquee_32s_linear_infinite] items-center gap-10 whitespace-nowrap hover:[animation-play-state:paused]">
          {[0, 1].map((k) => (
            <div
              key={k}
              className="flex items-center gap-10"
              aria-hidden={k === 1 ? true : undefined}
            >
              {PARTNERS.map((p, i) => (
                <Fragment key={`${k}-${p.src}`}>
                  {i > 0 && <Dot />}
                  <div className="flex items-center opacity-100 transition-all duration-300 hover:opacity-60">
                    <img
                      src={p.src}
                      alt={p.alt}
                      className="h-8 w-auto max-w-none object-contain sm:h-9"
                      loading="lazy"
                      draggable={false}
                    />
                  </div>
                </Fragment>
              ))}
              <Dot />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
