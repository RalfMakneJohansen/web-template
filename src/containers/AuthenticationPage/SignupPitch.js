import React from 'react';

import { FormattedMessage } from '../../util/reactIntl';

import css from './SignupPitch.module.css';

/**
 * FAIRWAY: the reason to make an account, next to the form that asks for one.
 *
 * The signup page was a form on a photograph. Half the screen was doing
 * nothing while the other half asked for an email address, which is the wrong
 * trade to put in front of someone who has not been told what they get.
 *
 * Three points, one per side of the marketplace plus the one that applies to
 * both. Shown only from tablet up — on a phone the form should be the whole
 * screen, and anything above it just pushes the first field below the fold.
 */
const POINTS = ['free', 'protected', 'box'];

const CheckIcon = () => (
  <svg
    className={css.checkIcon}
    width="18"
    height="18"
    viewBox="0 0 20 20"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.7"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden={true}
  >
    <circle cx="10" cy="10" r="7.7" />
    <path d="m6.6 10.2 2.3 2.3 4.5-4.7" />
  </svg>
);

const SignupPitch = () => (
  <aside className={css.root}>
    <p className={css.eyebrow}>
      <FormattedMessage id="SignupPitch.eyebrow" />
    </p>
    <h2 className={css.title}>
      <FormattedMessage id="SignupPitch.title" />
    </h2>

    <ul className={css.points}>
      {POINTS.map(point => (
        <li key={point} className={css.point}>
          <span className={css.pointIcon} aria-hidden={true}>
            <CheckIcon />
          </span>
          <span>
            <strong className={css.pointTitle}>
              <FormattedMessage id={`SignupPitch.${point}_title`} />
            </strong>
            <span className={css.pointText}>
              <FormattedMessage id={`SignupPitch.${point}_text`} />
            </span>
          </span>
        </li>
      ))}
    </ul>
  </aside>
);

export default SignupPitch;
