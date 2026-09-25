import React from 'react';
import classNames from 'classnames';

import { FormattedMessage } from '../../util/reactIntl';
import { getTradeReadiness } from '../../util/fairwayContact';

import NamedLink from '../NamedLink/NamedLink';

import css from './TradeReadiness.module.css';

const CheckIcon = () => (
  <svg viewBox="0 0 16 16" aria-hidden={true}>
    <path d="m4 8.5 2.5 2.5L12 5.5" />
  </svg>
);

const DotIcon = () => (
  <svg viewBox="0 0 16 16" aria-hidden={true}>
    <circle cx="8" cy="8" r="2.5" />
  </svg>
);

/**
 * FAIRWAY: what a user has in place to trade, as a checklist.
 *
 * Selling needs three things before money can move: a verified email (order
 * emails go nowhere otherwise), a sender address and mobile number for the
 * freight label, and a payout account at Stripe, which also runs the identity
 * check. Each missing item links to where it is fixed. Buying needs nothing in
 * advance, and the card says so, so a buyer is not put off by a seller's list.
 *
 * Shown on the profile settings page, at the start of a new listing, and on
 * the trading guide page.
 *
 * @component
 * @param {Object} props
 * @param {string} [props.className] - Custom class that extends the default class for the root element
 * @param {string} [props.rootClassName] - Custom class that overrides the default class for the root element
 * @param {Object} props.currentUser - The current user, with the stripeAccount relationship
 * @param {'guide'|'profile'|'listing'} [props.context] - Where the card is shown; picks the heading and links
 * @param {boolean} [props.compact] - One line saying how much is missing, opening to the list
 * @returns {JSX.Element} the readiness checklist
 */
const TradeReadiness = props => {
  const { className, rootClassName, currentUser, context = 'profile', compact = false } = props;
  if (!currentUser?.id) {
    return null;
  }

  const readiness = getTradeReadiness(currentUser);
  const classes = classNames(rootClassName || css.root, className, {
    [css.ready]: readiness.readyToSell,
  });

  const items = [
    {
      key: 'email',
      done: readiness.emailVerified,
      linkName: 'ContactDetailsPage',
    },
    {
      key: 'sender',
      done: readiness.senderAddress,
      linkName: 'TradingGuidePage',
      linkTo: { hash: '#afsender' },
    },
    {
      key: 'payout',
      done: readiness.payoutAccount,
      linkName: 'StripePayoutPage',
    },
  ];

  // FAIRWAY: in a flow the full card pushed the actual question off the screen;
  // compact, it is one line that opens to the same list.
  if (compact) {
    const missing = items.filter(item => !item.done);
    if (missing.length === 0) {
      return null;
    }
    return (
      <details className={classNames(css.compact, className)}>
        <summary className={css.compactSummary}>
          <span className={css.compactCount}>{missing.length}</span>
          <span className={css.compactText}>
            <FormattedMessage
              id="TradeReadiness.compact.summary"
              values={{ count: missing.length }}
            />
          </span>
          <span className={css.compactToggle}>
            <FormattedMessage id="TradeReadiness.compact.toggle" />
          </span>
        </summary>
        <ul className={css.items}>
          {missing.map(item => (
            <li key={item.key} className={css.item}>
              <span className={css.mark}>
                <DotIcon />
              </span>
              <span className={css.itemCopy}>
                <span className={css.itemTitle}>
                  <FormattedMessage id={`TradeReadiness.${item.key}.title`} />
                </span>
                <span className={css.itemText}>
                  <FormattedMessage id={`TradeReadiness.${item.key}.todo`} />
                </span>
              </span>
              <NamedLink className={css.itemLink} name={item.linkName} to={item.linkTo}>
                <FormattedMessage id={`TradeReadiness.${item.key}.cta`} />
              </NamedLink>
            </li>
          ))}
        </ul>
      </details>
    );
  }

  const headingId = readiness.readyToSell
    ? `TradeReadiness.${context}.readyTitle`
    : `TradeReadiness.${context}.title`;

  return (
    <section className={classes} aria-labelledby={`tradeReadiness-${context}`}>
      <h2 id={`tradeReadiness-${context}`} className={css.title}>
        <FormattedMessage id={headingId} />
      </h2>
      <p className={css.lead}>
        <FormattedMessage id={`TradeReadiness.${context}.lead`} />
      </p>

      <ul className={css.items}>
        {items.map(item => (
          <li key={item.key} className={item.done ? css.itemDone : css.item}>
            <span className={item.done ? css.markDone : css.mark}>
              {item.done ? <CheckIcon /> : <DotIcon />}
            </span>
            <span className={css.itemCopy}>
              <span className={css.itemTitle}>
                <FormattedMessage id={`TradeReadiness.${item.key}.title`} />
              </span>
              <span className={css.itemText}>
                <FormattedMessage
                  id={`TradeReadiness.${item.key}.${item.done ? 'done' : 'todo'}`}
                />
              </span>
            </span>
            {item.done ? null : (
              <NamedLink className={css.itemLink} name={item.linkName} to={item.linkTo}>
                <FormattedMessage id={`TradeReadiness.${item.key}.cta`} />
              </NamedLink>
            )}
          </li>
        ))}
      </ul>

      <p className={css.buyerNote}>
        <FormattedMessage id="TradeReadiness.buyerNote" />
      </p>

      {context === 'guide' ? null : (
        <NamedLink className={css.guideLink} name="TradingGuidePage">
          <FormattedMessage id="TradeReadiness.guideLink" />
        </NamedLink>
      )}
    </section>
  );
};

export default TradeReadiness;
