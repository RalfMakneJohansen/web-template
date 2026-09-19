import React from 'react';
import '@testing-library/jest-dom';

import { types as sdkTypes } from '../../../../util/sdkLoader';
import { renderWithProviders as render, testingLibrary } from '../../../../util/testHelpers';

import { MIN_COMPARABLES, percentile, summarise } from '../../EditListingPage.duck';
import { PriceGuidance, positionPercent, verdictFor } from './PriceGuidance';

const { screen } = testingLibrary;
const { Money } = sdkTypes;

const listingWithPrice = (amount, currency = 'DKK') => ({
  attributes: { price: amount == null ? null : new Money(amount, currency) },
});

describe('price guidance maths', () => {
  it('interpolates percentiles', () => {
    const sorted = [100, 200, 300, 400, 500];
    expect(percentile(sorted, 0)).toEqual(100);
    expect(percentile(sorted, 0.5)).toEqual(300);
    expect(percentile(sorted, 1)).toEqual(500);
    expect(percentile(sorted, 0.25)).toEqual(200);
  });

  it('returns null below the comparable threshold', () => {
    const tooFew = Array.from({ length: MIN_COMPARABLES - 1 }, () => listingWithPrice(100000));
    expect(summarise(tooFew, 'DKK')).toBeNull();
  });

  it('summarises the interquartile range, not the extremes', () => {
    // One optimist asking 100.000 must not drag the band with them.
    const listings = [1000, 2000, 3000, 4000, 100000].map(a => listingWithPrice(a * 100));
    const summary = summarise(listings, 'DKK');

    expect(summary.count).toEqual(5);
    expect(summary.median).toEqual(300000);
    expect(summary.low).toEqual(200000);
    expect(summary.high).toEqual(400000);
  });

  it('ignores prices in another currency and listings without a price', () => {
    const listings = [
      listingWithPrice(100000),
      listingWithPrice(200000),
      listingWithPrice(300000),
      listingWithPrice(400000),
      listingWithPrice(999999, 'EUR'),
      listingWithPrice(null),
    ];
    expect(summarise(listings, 'DKK').count).toEqual(4);
  });
});

describe('price guidance marker', () => {
  it('places a price inside the band between the band edges', () => {
    const low = positionPercent(2000, 2000, 4000);
    const mid = positionPercent(3000, 2000, 4000);
    const high = positionPercent(4000, 2000, 4000);

    expect(mid).toBeGreaterThan(low);
    expect(mid).toBeLessThan(high);
  });

  it('clamps a wildly high price to the end of the track', () => {
    expect(positionPercent(500000, 2000, 4000)).toEqual(100);
    expect(positionPercent(0, 2000, 4000)).toEqual(0);
  });

  it('reads a price against the band', () => {
    expect(verdictFor(1000, 2000, 4000)).toEqual('below');
    expect(verdictFor(3000, 2000, 4000)).toEqual('inside');
    expect(verdictFor(5000, 2000, 4000)).toEqual('above');
    expect(verdictFor(null, 2000, 4000)).toBeNull();
  });
});

describe('PriceGuidance', () => {
  const guidance = { count: 7, low: 240000, high: 310000, median: 275000, scope: 'category' };

  it('renders nothing when there are not enough comparables', () => {
    const { container } = render(<PriceGuidance guidance={null} currency="DKK" />);
    expect(container).toBeEmptyDOMElement();
  });

  it('shows the range and tells the seller they are in the market', () => {
    render(
      <PriceGuidance
        guidance={guidance}
        currency="DKK"
        currentPrice={new Money(275000, 'DKK')}
      />
    );

    expect(screen.getByText('PriceGuidance.verdict_inside')).toBeInTheDocument();
    expect(screen.getByText('PriceGuidance.footnote')).toBeInTheDocument();
  });

  it('warns when the asking price is over the band', () => {
    render(
      <PriceGuidance guidance={guidance} currency="DKK" currentPrice={new Money(800000, 'DKK')} />
    );
    expect(screen.getByText('PriceGuidance.verdict_above')).toBeInTheDocument();
  });

  it('gives no verdict before a price has been typed', () => {
    render(<PriceGuidance guidance={guidance} currency="DKK" currentPrice={null} />);
    expect(screen.queryByText('PriceGuidance.verdict_inside')).not.toBeInTheDocument();
    expect(screen.queryByText('PriceGuidance.verdict_below')).not.toBeInTheDocument();
  });
});
