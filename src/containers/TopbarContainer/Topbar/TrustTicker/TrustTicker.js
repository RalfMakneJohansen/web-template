import React from 'react';

import css from './TrustTicker.module.css';

/**
 * FAIRWAY: the promise, above everything else.
 *
 * The whole argument for using a marketplace instead of a Facebook group is
 * that someone stands between the two strangers. That belonged at the top of
 * every page rather than only in the footer, where it was read last or not at
 * all.
 *
 * It scrolls because four claims do not fit on a phone and a wrapped block of
 * small caps looks like a cookie banner. The list is repeated so the loop has
 * no gap, and the duplicate is hidden from assistive technology — a screen
 * reader should hear the four claims once.
 */
const CLAIMS = [
  'Pengene holdes hos Fairway til du har godkendt varen',
  'Forsikret fragt med track & trace',
  '48 timers inspektion',
  'Fragtlabel betalt for sælger',
];

const Marks = props => (
  <ul className={css.list} aria-hidden={props.ariaHidden}>
    {CLAIMS.map(claim => (
      <li key={claim} className={css.item}>
        {claim}
      </li>
    ))}
  </ul>
);

const TrustTicker = () => (
  <div className={css.root}>
    <div className={css.track}>
      <Marks />
      <Marks ariaHidden={true} />
    </div>
  </div>
);

export default TrustTicker;
