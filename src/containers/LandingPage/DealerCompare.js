import React, { useEffect, useRef, useState } from 'react';

import { NamedLink } from '../../components';

import css from './DealerCompare.module.css';

/**
 * Selling to a dealer against selling here, as one worked example.
 *
 * A trade-in is the alternative most sellers actually weigh us against, and
 * the difference is easiest to believe as money in a bar rather than as a
 * claim in a sentence. Dealers typically offer 40–50% of the used price; the
 * dealer's bar shows that as a solid 40% and a lighter band to 50%. The
 * figures are an illustration and say so on the page, and the dealer's real
 * advantage — speed — is listed on its side, so the comparison is one a
 * dealer could read without objecting to.
 *
 * The bars fill when the section scrolls into view, once. Without
 * IntersectionObserver, or with reduced motion, they are simply full.
 */

// The worked example: the used price of a driver, and a dealer's trade-in
// offer at the usual 40–50% of that price.
const RESALE_VALUE = 2000;
const DEALER_SHARE_LOW = 0.4;
const DEALER_SHARE_HIGH = 0.5;
const BUYER_FEE_RATE = 0.0499;

const formatNumber = amount =>
  Math.round(amount)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, '.');

const formatKr = amount => `${formatNumber(amount)} kr.`;
const formatRange = (low, high) => `${formatNumber(low)}–${formatNumber(high)} kr.`;

const DEALER_POINTS = [
  { good: false, text: 'Butikken sætter prisen' },
  { good: false, text: 'Ofte som tilgodebevis, ikke kontanter' },
  { good: true, text: 'Hurtigt — du går derfra samme dag' },
];

const FAIRWAY_POINTS = [
  { good: true, text: 'Du sætter selv prisen' },
  { good: true, text: 'Pengene går ind på din konto' },
  { good: true, text: 'Gratis kasse, når varen er solgt' },
  { good: true, text: '0 kr. i gebyr for dig som sælger' },
];

const Mark = ({ good }) =>
  good ? (
    <svg className={css.markGood} viewBox="0 0 16 16" aria-hidden={true}>
      <path d="m4 8.5 2.5 2.5L12 5.5" />
    </svg>
  ) : (
    <svg className={css.markBad} viewBox="0 0 16 16" aria-hidden={true}>
      <path d="m5 5 6 6M11 5l-6 6" />
    </svg>
  );

const Points = ({ points }) => (
  <ul className={css.points}>
    {points.map(point => (
      <li key={point.text} className={css.point}>
        <Mark good={point.good} />
        <span>{point.text}</span>
      </li>
    ))}
  </ul>
);

const useInView = () => {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node || typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      setInView(true);
      return undefined;
    }
    const observer = new window.IntersectionObserver(
      entries => {
        if (entries.some(entry => entry.isIntersecting)) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return [ref, inView];
};

const DealerCompare = () => {
  const [ref, inView] = useInView();

  const dealerLow = RESALE_VALUE * DEALER_SHARE_LOW;
  const dealerHigh = RESALE_VALUE * DEALER_SHARE_HIGH;
  const percentLow = Math.round(DEALER_SHARE_LOW * 100);
  const percentHigh = Math.round(DEALER_SHARE_HIGH * 100);
  const percentRange = `${percentLow}–${percentHigh} %`;
  const buyerPays = RESALE_VALUE * (1 + BUYER_FEE_RATE);

  return (
    <section ref={ref} className={inView ? `${css.root} ${css.inView}` : css.root}>
      <div className={css.inner}>
        <span className={css.eyebrow}>Sælg smartere</span>
        <h2 className={css.title}>Forhandleren eller Fairway?</h2>
        <p className={css.lead}>
          Når du indleverer brugt udstyr, giver forhandleren typisk kun{' '}
          <strong className={css.leadStrong}>{percentRange}</strong> af brugtprisen. Resten
          er butikkens avance, når den sælger videre.
        </p>

        <p className={css.example}>
          <span className={css.exampleDot} aria-hidden={true} />
          Eksempel: brugt driver til {formatKr(RESALE_VALUE)}
        </p>

        <div className={css.cards}>
          <article className={css.card}>
            <header className={css.cardHead}>
              <span className={css.cardWho}>Indlevering hos forhandler</span>
              <span className={css.amountMuted}>{formatRange(dealerLow, dealerHigh)}</span>
            </header>

            <div
              className={css.bar}
              role="img"
              aria-label={`Du får ${percentRange} af ${formatKr(RESALE_VALUE)}`}
            >
              <span className={css.barFillMuted} style={{ '--share': DEALER_SHARE_LOW }}>
                <span className={css.barLabel}>{percentRange}</span>
              </span>
              <span
                className={css.barRange}
                style={{ '--share': DEALER_SHARE_HIGH - DEALER_SHARE_LOW }}
              />
              <span className={css.barRest}>Butikkens avance</span>
            </div>

            <Points points={DEALER_POINTS} />
          </article>

          <div className={css.gain} aria-hidden={true}>
            <span className={css.gainValue}>
              +{formatRange(RESALE_VALUE - dealerHigh, RESALE_VALUE - dealerLow)}
            </span>
            <span className={css.gainLabel}>mere til dig</span>
          </div>

          <article className={`${css.card} ${css.cardOwn}`}>
            <header className={css.cardHead}>
              <span className={css.cardWho}>
                Salg på Fairway
                <span className={css.badge}>Mest til dig</span>
              </span>
              <span className={css.amount}>{formatKr(RESALE_VALUE)}</span>
            </header>

            <div
              className={css.bar}
              role="img"
              aria-label={`Du får hele ${formatKr(RESALE_VALUE)}`}
            >
              <span className={css.barFill} style={{ '--share': 1 }}>
                <span className={css.barLabel}>100 % af prisen</span>
              </span>
            </div>

            <Points points={FAIRWAY_POINTS} />

            <NamedLink name="NewListingPage" className={css.cta}>
              Sælg dit udstyr
              <svg viewBox="0 0 16 16" aria-hidden={true}>
                <path d="M3 8h9.5M9 4.5 12.5 8 9 11.5" />
              </svg>
            </NamedLink>
          </article>
        </div>

        <p className={css.fine}>
          Regneeksempel. Forhandlere giver typisk {percentRange} af brugtprisen ved indlevering,
          og tilbuddet varierer fra butik til butik. På Fairway betaler køber et gebyr på
          4,99 %, i eksemplet {formatKr(buyerPays)} i alt — du får hele din pris.
        </p>
      </div>
    </section>
  );
};

export default DealerCompare;
