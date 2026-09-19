import React from 'react';

import { FormattedMessage, useIntl } from '../../../util/reactIntl';
import { types as sdkTypes } from '../../../util/sdkLoader';
import { formatMoney } from '../../../util/currency';
import {
  LINE_ITEM_CUSTOMER_COMMISSION,
  LINE_ITEM_ITEM,
  LINE_ITEM_PICKUP_FEE,
  LINE_ITEM_SHIPPING_FEE,
} from '../../../util/types';

import css from './FairwayPriceBreakdown.module.css';

const { Money } = sdkTypes;

/**
 * What the buyer actually pays, itemised.
 *
 * Built from the line items the *server* returns, never from a rate written
 * into the frontend: if the commission model is changed in Console, this
 * follows it. A breakdown that can drift from what is charged is worse than no
 * breakdown at all.
 *
 * Only lines with `includeFor: customer` are shown — the provider commission is
 * deducted from the seller's payout and is none of the buyer's business.
 */
const LABEL_IDS = {
  [LINE_ITEM_ITEM]: 'FairwayPriceBreakdown.item',
  [LINE_ITEM_SHIPPING_FEE]: 'FairwayPriceBreakdown.shipping',
  [LINE_ITEM_PICKUP_FEE]: 'FairwayPriceBreakdown.pickup',
  [LINE_ITEM_CUSTOMER_COMMISSION]: 'FairwayPriceBreakdown.protection',
};

const Row = props => {
  const { label, value, muted = false } = props;
  return (
    <div className={css.row}>
      <span className={css.rowLabel}>{label}</span>
      <span className={muted ? `${css.rowValue} ${css.rowValueMuted}` : css.rowValue}>{value}</span>
    </div>
  );
};

const FairwayPriceBreakdown = props => {
  const { lineItems, currency, className } = props;
  const intl = useIntl();

  const customerLines = (lineItems || []).filter(
    item => item.includeFor?.includes('customer') && !item.reversal
  );

  if (customerLines.length === 0) {
    return null;
  }

  const totalSubunits = customerLines.reduce((sum, item) => sum + (item.lineTotal?.amount || 0), 0);
  const total = new Money(totalSubunits, currency);

  const hasProtectionLine = customerLines.some(
    item => item.code === LINE_ITEM_CUSTOMER_COMMISSION
  );

  return (
    <div className={className ? `${css.root} ${className}` : css.root}>
      {customerLines.map(item => {
        const labelId = LABEL_IDS[item.code];
        const isFree = item.lineTotal?.amount === 0;
        return (
          <Row
            key={item.code}
            label={labelId ? <FormattedMessage id={labelId} /> : item.code.replace('line-item/', '')}
            value={
              isFree ? (
                <FormattedMessage id="FairwayPriceBreakdown.free" />
              ) : (
                formatMoney(intl, item.lineTotal)
              )
            }
            muted={isFree}
          />
        );
      })}

      {/* The 10% is currently taken from the seller's payout, so the buyer is
          charged nothing for it. Say so plainly rather than hiding the line —
          it is the strongest thing on the page. If a customer commission is
          switched on in Console, the real line above replaces this. */}
      {hasProtectionLine ? null : (
        <Row
          label={<FormattedMessage id="FairwayPriceBreakdown.protection" />}
          value={<FormattedMessage id="FairwayPriceBreakdown.included" />}
          muted
        />
      )}

      <div className={css.totalRow}>
        <span className={css.totalLabel}>
          <FormattedMessage id="FairwayPriceBreakdown.total" />
        </span>
        <span className={css.totalValue}>{formatMoney(intl, total)}</span>
      </div>
    </div>
  );
};

export default FairwayPriceBreakdown;
