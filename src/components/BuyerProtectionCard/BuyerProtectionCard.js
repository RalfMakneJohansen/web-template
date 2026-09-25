import React from 'react';
import classNames from 'classnames';

import { FormattedMessage } from '../../util/reactIntl';

import NamedLink from '../NamedLink/NamedLink';

import css from './BuyerProtectionCard.module.css';

// The promises, in the order a buyer worries about them. Each is backed by
// the transaction process: payment is held until approval, the buyer has 48
// hours from delivery, and an order not delivered in 14 days is cancelled and
// refunded (ext/transaction-processes/default-purchase).
const PROMISES = ['held', 'inspect', 'refund'];

const ShieldIcon = () => (
  <svg className={css.shield} width="44" height="44" viewBox="0 0 48 48" aria-hidden={true}>
    <path
      d="M24 4 8 10v11.5C8 32 14.8 40.6 24 44c9.2-3.4 16-12 16-22.5V10L24 4Z"
      className={css.shieldBody}
    />
    <path d="m17 24.5 5 5 9.5-10" className={css.shieldCheck} />
  </svg>
);

const CheckIcon = () => (
  <svg className={css.check} width="16" height="16" viewBox="0 0 16 16" aria-hidden={true}>
    <path d="m3.5 8.5 3 3 6-7" />
  </svg>
);

/**
 * FAIRWAY: what the buyer is promised, next to the buy button.
 *
 * @component
 * @param {Object} props
 * @param {string} [props.className]
 * @returns {JSX.Element}
 */
const BuyerProtectionCard = props => {
  const { className } = props;
  return (
    <section className={classNames(css.root, className)} aria-labelledby="buyer-protection-title">
      <div className={css.body}>
        <h2 id="buyer-protection-title" className={css.title}>
          <FormattedMessage id="BuyerProtectionCard.title" />
        </h2>
        <ul className={css.list}>
          {PROMISES.map(key => (
            <li key={key} className={css.item}>
              <CheckIcon />
              <span>
                <FormattedMessage id={`BuyerProtectionCard.${key}`} />
              </span>
            </li>
          ))}
        </ul>
        <NamedLink name="CMSPage" params={{ pageId: 'tryghed' }} className={css.link}>
          <FormattedMessage id="BuyerProtectionCard.readMore" />
        </NamedLink>
      </div>
      <ShieldIcon />
    </section>
  );
};

export default BuyerProtectionCard;
