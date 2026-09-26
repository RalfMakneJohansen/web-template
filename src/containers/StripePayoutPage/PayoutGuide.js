import React from 'react';
import classNames from 'classnames';

import { FormattedMessage } from '../../util/reactIntl';

import css from './PayoutGuide.module.css';

/**
 * Where the seller is in setting up payouts.
 *
 * @param {Object} params
 * @param {boolean} params.stripeAvailable - Whether the marketplace has a Stripe key at all
 * @param {boolean} params.stripeConnected - Whether the seller has a Stripe account
 * @param {boolean} params.requirementsMissing - Whether Stripe still needs details
 * @returns {'unavailable'|'notStarted'|'needsInfo'|'ready'}
 */
export const payoutState = ({ stripeAvailable, stripeConnected, requirementsMissing }) =>
  !stripeAvailable
    ? 'unavailable'
    : !stripeConnected
    ? 'notStarted'
    : requirementsMissing
    ? 'needsInfo'
    : 'ready';

// How far along each state is: steps before this index are done
const DONE_UP_TO = { unavailable: 0, notStarted: 0, needsInfo: 1, ready: 4 };

const STEPS = ['country', 'verify', 'bank', 'done'];
const NEEDS = ['name', 'birthday', 'phone', 'iban', 'id'];
const QUESTIONS = ['whyStripe', 'when', 'cost'];

const Icon = ({ name }) => {
  const paths = {
    bank: (
      <>
        <path d="M3 10h18L12 4 3 10Z" />
        <path d="M5 10v8M9.5 10v8M14.5 10v8M19 10v8M3 20h18" />
      </>
    ),
    shield: (
      <>
        <path d="M12 3 5 6v5c0 4.5 3 8.3 7 10 4-1.7 7-5.5 7-10V6l-7-3Z" />
        <path d="m9 12 2 2 4-4" />
      </>
    ),
    alert: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7.5v5.5M12 16.2v.3" />
      </>
    ),
    clock: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </>
    ),
    check: <path d="m5 12.5 4.5 4.5L19 7.5" />,
  };
  return (
    <svg className={css.icon} width="24" height="24" viewBox="0 0 24 24" aria-hidden={true}>
      {paths[name]}
    </svg>
  );
};

const HERO_ICON = { unavailable: 'clock', notStarted: 'bank', needsInfo: 'alert', ready: 'shield' };

/**
 * FAIRWAY: payouts, explained before they are asked for.
 *
 * The template's payout page was a country dropdown and two radio buttons
 * under a heading — nothing said why a golf marketplace wants your bank
 * details, what Stripe is, or what you would need to have at hand. Sellers
 * who stop here never get paid, so this page does the explaining: where you
 * are, the four steps, what to have ready, and the three questions everyone
 * asks. The form itself follows underneath, unchanged.
 *
 * @component
 * @param {Object} props
 * @param {'unavailable'|'notStarted'|'needsInfo'|'ready'} props.state - From payoutState()
 * @param {string} [props.bankLast4] - The last digits of the saved bank account
 * @param {ReactNode} [props.children] - The form, shown under the steps
 * @returns {JSX.Element}
 */
const PayoutGuide = props => {
  const { state, bankLast4, children } = props;
  const doneUpTo = DONE_UP_TO[state] ?? 0;

  return (
    <div className={css.root}>
      <section className={classNames(css.hero, css[`hero_${state}`])}>
        <span className={css.heroIcon}>
          <Icon name={HERO_ICON[state]} />
        </span>
        <div className={css.heroBody}>
          <p className={css.heroStatus}>
            <FormattedMessage id={`PayoutGuide.status.${state}`} />
          </p>
          <h2 className={css.heroTitle}>
            <FormattedMessage id={`PayoutGuide.title.${state}`} />
          </h2>
          <p className={css.heroText}>
            <FormattedMessage
              id={`PayoutGuide.text.${state}`}
              values={{ last4: bankLast4 || '••••' }}
            />
          </p>
        </div>
      </section>

      {state !== 'ready' ? (
        <ol className={css.steps}>
          {STEPS.map((step, i) => {
            const isDone = i < doneUpTo;
            const isCurrent = i === doneUpTo && state !== 'unavailable';
            return (
              <li
                key={step}
                className={classNames(css.step, {
                  [css.stepDone]: isDone,
                  [css.stepCurrent]: isCurrent,
                })}
                style={{ '--i': i }}
              >
                <span className={css.stepMark} aria-hidden={true}>
                  {isDone ? <Icon name="check" /> : i + 1}
                </span>
                <span className={css.stepBody}>
                  <span className={css.stepTitle}>
                    <FormattedMessage id={`PayoutGuide.step.${step}.title`} />
                  </span>
                  <span className={css.stepText}>
                    <FormattedMessage id={`PayoutGuide.step.${step}.text`} />
                  </span>
                  <span className={css.stepWhere}>
                    <FormattedMessage id={`PayoutGuide.step.${step}.where`} />
                  </span>
                </span>
              </li>
            );
          })}
        </ol>
      ) : null}

      {children ? <div className={css.formCard}>{children}</div> : null}

      {state === 'notStarted' || state === 'needsInfo' ? (
        <section className={css.needs}>
          <h3 className={css.sectionTitle}>
            <FormattedMessage id="PayoutGuide.needsTitle" />
          </h3>
          <ul className={css.needList}>
            {NEEDS.map(need => (
              <li key={need} className={css.need}>
                <span className={css.needTick} aria-hidden={true}>
                  <Icon name="check" />
                </span>
                <FormattedMessage id={`PayoutGuide.need.${need}`} />
              </li>
            ))}
          </ul>
          <p className={css.needsNote}>
            <FormattedMessage id="PayoutGuide.needsNote" />
          </p>
        </section>
      ) : null}

      <section className={css.faq}>
        <h3 className={css.sectionTitle}>
          <FormattedMessage id="PayoutGuide.faqTitle" />
        </h3>
        {QUESTIONS.map(q => (
          <details key={q} className={css.question}>
            <summary className={css.questionTitle}>
              <FormattedMessage id={`PayoutGuide.q.${q}`} />
            </summary>
            <p className={css.answer}>
              <FormattedMessage id={`PayoutGuide.a.${q}`} />
            </p>
          </details>
        ))}
      </section>
    </div>
  );
};

export default PayoutGuide;
