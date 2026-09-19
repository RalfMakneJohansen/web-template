import React, { useState } from 'react';

import boxDriver from '../../assets/box/box-driver.jpg';
import boxPakning from '../../assets/box/box-pakning.jpg';
import kasseFlad from '../../assets/box/kasse-flad.jpg';
import kasseRejst from '../../assets/box/kasse-rejst.jpg';

import css from './LandingPage.module.css';

/**
 * The box, one photo at a time, advanced by the visitor.
 *
 * Four steps beat four thumbnails here: each photo gets the whole frame, and
 * clicking through is the closest thing to unfolding the box yourself.
 *
 * `product` shots came from the supplier on white, so they sit contained on a
 * paper ground; the two from the floor are cropped to fill.
 */
const STEPS = [
  {
    src: kasseRejst,
    product: true,
    label: 'Kassen',
    caption: '120 × 120 × 1200 mm — bygget til en driver i fuld længde.',
    alt: 'Den rejste forsendelseskasse set forfra',
  },
  {
    src: kasseFlad,
    product: true,
    label: 'Sådan kommer den',
    caption: 'Fladpakket til din adresse. Du folder den ud på et minut.',
    alt: 'Kassen fladpakket',
  },
  {
    src: boxDriver,
    product: false,
    label: 'Driveren i',
    caption: 'Hele køllen ligger ned med headcover på.',
    alt: 'En driver ved siden af den lange kasse på et trægulv',
  },
  {
    src: boxPakning,
    product: false,
    label: 'Eller jernsættet',
    caption: 'Otte kilo jern, pakket og klar til pakkeshoppen.',
    alt: 'Et jernsæt lægges ned i kassen',
  },
];

const BoxWalkthrough = () => {
  const [index, setIndex] = useState(0);
  const step = STEPS[index];
  const isLast = index === STEPS.length - 1;

  const advance = () => setIndex(i => (i + 1) % STEPS.length);

  return (
    <div className={css.walk}>
      <div className={css.walkStage}>
        <img
          // the key remounts the image so the fade replays on every step
          key={index}
          className={step.product ? `${css.walkImage} ${css.walkImageProduct}` : css.walkImage}
          src={step.src}
          alt={step.alt}
        />
        <span className={css.walkCount}>
          {index + 1} / {STEPS.length}
        </span>
      </div>

      <div className={css.walkBody}>
        <span className={css.walkLabel}>{step.label}</span>
        <p className={css.walkCaption}>{step.caption}</p>
      </div>

      <div className={css.walkFoot}>
        <button type="button" className={css.walkButton} onClick={advance}>
          {isLast ? 'Se den igen' : 'Klik og se'}
          <svg
            className={css.walkArrow}
            width="15"
            height="15"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden={true}
          >
            <path d="M3 8h9.5" />
            <path d="m9 4.5 3.5 3.5L9 11.5" />
          </svg>
        </button>

        <ol className={css.walkDots}>
          {STEPS.map((s, i) => (
            <li key={s.label}>
              <button
                type="button"
                className={i === index ? `${css.walkDot} ${css.walkDotOn}` : css.walkDot}
                aria-current={i === index}
                onClick={() => setIndex(i)}
              >
                <span className={css.visuallyHidden}>{`Trin ${i + 1}: ${s.label}`}</span>
              </button>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
};

export default BoxWalkthrough;
