import React from 'react';

import css from './FairwayCardSkeleton.module.css';

/**
 * FAIRWAY: what a results grid shows while it is loading.
 *
 * The template faded the previous results to 10% opacity, which reads as a
 * page that has broken rather than one that is working. Placeholders in the
 * shape of the real card keep the grid's geometry, so nothing jumps when the
 * listings land, and the shimmer says "working" without a spinner.
 *
 * Hidden from assistive technology: a screen reader should hear the result
 * count when it arrives, not eight empty cards.
 *
 * @param {number} [count=8] how many placeholders to draw
 */
const FairwayCardSkeleton = props => {
  const { count = 8 } = props;

  return (
    <>
      {Array.from({ length: count }, (_, i) => (
        <li key={i} className={css.item} aria-hidden={true}>
          <div className={css.image} />
          <div className={css.brand} />
          <div className={css.title} />
          <div className={css.price} />
        </li>
      ))}
    </>
  );
};

export default FairwayCardSkeleton;
