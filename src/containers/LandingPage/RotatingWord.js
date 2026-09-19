import React, { useEffect, useState } from 'react';

import css from './LandingPage.module.css';

const INTERVAL_MS = 2600;

/**
 * Cycles through words in place. The rotation is decorative, so it is hidden
 * from assistive tech and the caller renders the full phrase for screen readers.
 *
 * @param {Object} props
 * @param {string[]} props.words
 */
const RotatingWord = props => {
  const { words } = props;
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      return undefined;
    }

    const id = window.setInterval(() => {
      setIndex(current => (current + 1) % words.length);
    }, INTERVAL_MS);

    return () => window.clearInterval(id);
  }, [words.length]);

  return (
    <span className={css.rotator} aria-hidden={true}>
      <span key={index} className={css.rotatorWord}>
        {words[index]}
      </span>
    </span>
  );
};

export default RotatingWord;
