import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { FormattedMessage, useIntl } from '../../../../util/reactIntl';
import { formatMoney } from '../../../../util/currency';
import { types as sdkTypes } from '../../../../util/sdkLoader';
import { EVENTS, track } from '../../../../analytics/track';

import { fetchPriceGuidance } from '../../EditListingPage.duck';

import css from './PriceGuidance.module.css';

const { Money } = sdkTypes;

/**
 * FAIRWAY: comparable prices, live under the price field.
 *
 * The bar is drawn wider than the band on purpose — a seller who types 8.000
 * for a 3.000 kr. club needs to see how far outside they are, not a marker
 * pinned to the edge.
 */
const DOMAIN_PADDING = 0.6;

export const positionPercent = (amount, low, high) => {
  const span = high - low || 1;
  const domainLow = low - span * DOMAIN_PADDING;
  const domainHigh = high + span * DOMAIN_PADDING;
  const raw = ((amount - domainLow) / (domainHigh - domainLow)) * 100;
  return Math.min(100, Math.max(0, raw));
};

export const verdictFor = (amount, low, high) =>
  amount == null ? null : amount < low ? 'below' : amount > high ? 'above' : 'inside';

/**
 * The display. Kept free of data fetching so it can be rendered — and
 * checked — without a store behind it.
 */
export const PriceGuidance = props => {
  const { guidance, currency, currentPrice } = props;
  const intl = useIntl();

  // No guidance is the normal state early on: nothing is shown rather than a
  // range built from one or two listings.
  if (!guidance) {
    return null;
  }

  const { low, high, count, scope, brand } = guidance;
  const lowLabel = formatMoney(intl, new Money(low, currency));
  const highLabel = formatMoney(intl, new Money(high, currency));

  const amount = currentPrice?.currency === currency ? currentPrice.amount : null;
  const verdict = verdictFor(amount, low, high);

  return (
    <div className={css.root}>
      <p className={css.headline}>
        <FormattedMessage
          id={scope === 'brand' ? 'PriceGuidance.rangeBrand' : 'PriceGuidance.rangeCategory'}
          values={{
            count,
            brand,
            low: <span className={css.amount}>{lowLabel}</span>,
            high: <span className={css.amount}>{highLabel}</span>,
          }}
        />
      </p>

      <div className={css.track} aria-hidden={true}>
        <span
          className={css.band}
          style={{
            left: `${positionPercent(low, low, high)}%`,
            right: `${100 - positionPercent(high, low, high)}%`,
          }}
        />
        {amount != null ? (
          <span className={css.marker} style={{ left: `${positionPercent(amount, low, high)}%` }} />
        ) : null}
      </div>

      {verdict ? (
        <p className={verdict === 'inside' ? css.verdictGood : css.verdict}>
          <FormattedMessage id={`PriceGuidance.verdict_${verdict}`} />
        </p>
      ) : null}

      <p className={css.footnote}>
        <FormattedMessage id="PriceGuidance.footnote" />
      </p>
    </div>
  );
};

/**
 * Fetches the comparables for the listing being edited and hands them to the
 * display above.
 */
const PriceGuidanceContainer = props => {
  const { category, brand, currency, listingId, currentPrice } = props;
  const dispatch = useDispatch();

  const guidance = useSelector(state => state.EditListingPage.priceGuidance);

  useEffect(() => {
    dispatch(fetchPriceGuidance({ category, brand, currency, excludeListingId: listingId }));
  }, [dispatch, category, brand, currency, listingId]);

  // Counted once per lookup that produced something, so we can tell whether
  // guidance actually changes what sellers ask.
  useEffect(() => {
    if (guidance) {
      track(EVENTS.PRICE_GUIDANCE_SHOWN, {
        category: guidance.category,
        scope: guidance.scope,
        comparables: guidance.count,
      });
    }
  }, [guidance]);

  return <PriceGuidance guidance={guidance} currency={currency} currentPrice={currentPrice} />;
};

export default PriceGuidanceContainer;
