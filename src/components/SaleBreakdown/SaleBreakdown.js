import React from 'react';
import classNames from 'classnames';

import { FormattedMessage } from '../../util/reactIntl';
import { saleBreakdown, isShipped } from '../../util/fairwayFees';

import css from './SaleBreakdown.module.css';

// Whole kroner with a Danish thousands separator: 124950 øre → "1.250 kr."
export const formatKr = subunits =>
  `${Math.round((subunits || 0) / 100)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, '.')} kr.`;

/**
 * FAIRWAY: the money on a listing, line by line.
 *
 * What the seller gets (the whole price) and what the buyer pays (price, our
 * fee and freight), for the shipping choice given. Used live under the price
 * field and under the shipping choices, so a seller sees the effect of every
 * keypress and every choice.
 *
 * @component
 * @param {Object} props
 * @param {string} [props.className] - Custom class that extends the default class for the root element
 * @param {number} props.priceSubunits - The listing price in øre
 * @param {string} [props.shipmentType] - 'own' | 'box' | 'meetup'; treated as shipped when unknown
 * @returns {JSX.Element|null} the breakdown, or nothing without a price
 */
const SaleBreakdown = props => {
  const { className, priceSubunits, shipmentType } = props;
  if (!priceSubunits || priceSubunits <= 0) {
    return null;
  }
  const b = saleBreakdown(priceSubunits, shipmentType);
  const shipped = isShipped(shipmentType);

  return (
    <div className={classNames(css.root, className)} aria-live="polite">
      <div className={css.payout}>
        <span className={css.payoutLabel}>
          <FormattedMessage id="SaleBreakdown.youGet" />
        </span>
        <span className={css.payoutAmount}>{formatKr(b.sellerPayout)}</span>
        <span className={css.payoutNote}>
          <FormattedMessage id="SaleBreakdown.noSellerFees" />
        </span>
      </div>

      <dl className={css.lines}>
        <div className={css.line}>
          <dt>
            <FormattedMessage id="SaleBreakdown.price" />
          </dt>
          <dd>{formatKr(b.price)}</dd>
        </div>
        <div className={css.line}>
          <dt>
            <FormattedMessage id="SaleBreakdown.buyerFee" />
          </dt>
          <dd>{formatKr(b.buyerFee)}</dd>
        </div>
        <div className={css.line}>
          <dt>
            <FormattedMessage id="SaleBreakdown.freight" />
          </dt>
          <dd>{shipped ? formatKr(b.freight) : <FormattedMessage id="SaleBreakdown.noFreight" />}</dd>
        </div>
        <div className={css.total}>
          <dt>
            <FormattedMessage id="SaleBreakdown.buyerTotal" />
          </dt>
          <dd>{formatKr(b.buyerTotal)}</dd>
        </div>
      </dl>
    </div>
  );
};

export default SaleBreakdown;
