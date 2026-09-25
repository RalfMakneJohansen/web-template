import React, { useEffect, useState } from 'react';

import css from './LandingPage.module.css';

/**
 * The hero headline alternates between the two sides of the marketplace.
 *
 * Both lines stay in the DOM, stacked in one grid cell: the block is then as
 * tall as the longer of the two, so nothing below it moves when they swap. The
 * hidden one is taken out of the accessibility tree.
 *
 * The resting state is visible. The fade only ever runs *towards* opacity 1 and
 * sets no fill-mode, so if animations never run — a frozen compositor, a
 * screenshot, reduced motion — the headline still reads.
 */
const INTERVAL_MS = 5000;

const PHRASES = [
  { lead: 'Sælg dit udstyr —', accent: 'fragten er betalt', tail: '!' },
  { lead: 'Køb brugt udstyr', accent: 'med sikkerhed', tail: '' },
];

const RotatingHeadline = () => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => {
      setIndex(i => (i + 1) % PHRASES.length);
    }, INTERVAL_MS);
    return () => window.clearInterval(id);
  }, []);

  return (
    <h1 className={css.heroTitle}>
      <span className={css.heroStack}>
        {PHRASES.map((phrase, i) => {
          const isActive = i === index;
          return (
            <span
              // key includes the index so React remounts the line and the
              // fade replays on every swap
              key={`${i}-${isActive ? index : 'off'}`}
              className={isActive ? `${css.heroLine} ${css.heroLineOn}` : css.heroLine}
              aria-hidden={!isActive}
            >
              {phrase.lead} <span className={css.heroAccent}>{phrase.accent}</span>
              {phrase.tail}
            </span>
          );
        })}
      </span>
    </h1>
  );
};

export default RotatingHeadline;
