import React from 'react';
import classNames from 'classnames';

import { FormattedMessage, useIntl } from '../../../util/reactIntl';

import { NamedLink } from '../../../components';

import css from './WizardStepper.module.css';

const CheckIcon = () => (
  <svg
    className={css.check}
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden={true}
  >
    <path d="m3.5 8.5 3 3 6-7" />
  </svg>
);

/**
 * FAIRWAY: where you are in a new listing.
 *
 * A bar with how much is done, then the steps as circles joined by a line:
 * a tick for each step behind you (you can go back to it), the current one
 * ringed, the rest waiting. On a phone the labels give way to the circles and
 * one line saying which step this is.
 *
 * @component
 * @param {Object} props
 * @param {Array<{ key: string, label: string, linkProps: Object, reachable: boolean, completed?: boolean }>} props.steps
 * @param {number} props.currentIndex - Index of the step being filled in
 * @returns {JSX.Element}
 */
const WizardStepper = props => {
  const { steps, currentIndex } = props;
  const intl = useIntl();
  const total = steps.length;
  // A step is done when it is filled in (completed), or, when that is not
  // known, when it lies behind the current one
  const isStepDone = (step, i) =>
    i !== currentIndex && (typeof step.completed === 'boolean' ? step.completed : i < currentIndex);
  const doneCount = steps.filter(isStepDone).length;
  const percent = Math.round((Math.max(currentIndex, doneCount) / total) * 100);
  const current = steps[currentIndex];

  return (
    <div className={css.root}>
      <div className={css.progressRow}>
        <span className={css.stepCount}>
          <FormattedMessage
            id="EditListingWizard.stepOf"
            values={{ step: currentIndex + 1, total, label: current?.label }}
          />
        </span>
        <span className={css.percent}>
          <FormattedMessage id="EditListingWizard.percentDone" values={{ percent }} />
        </span>
      </div>
      <div
        className={css.track}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
        aria-label={intl.formatMessage({ id: 'EditListingWizard.percentDone' }, { percent })}
      >
        <span className={css.fill} style={{ width: `${Math.max(percent, 4)}%` }} />
      </div>

      <ol className={css.steps}>
        {steps.map((step, i) => {
          const isDone = isStepDone(step, i);
          const isCurrent = i === currentIndex;
          const content = (
            <>
              <span className={css.circle}>{isDone ? <CheckIcon /> : i + 1}</span>
              <span className={css.label}>{step.label}</span>
            </>
          );
          const classes = classNames(css.step, {
            [css.stepDone]: isDone,
            // the step just finished gets a small pop as its tick appears
            [css.stepJustDone]: i === currentIndex - 1,
            [css.stepCurrent]: isCurrent,
          });
          return (
            <li key={step.key} className={classes} aria-current={isCurrent ? 'step' : undefined}>
              {isDone && step.reachable ? (
                <NamedLink {...step.linkProps} className={css.stepLink}>
                  {content}
                </NamedLink>
              ) : (
                <span className={css.stepLink}>{content}</span>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
};

export default WizardStepper;
