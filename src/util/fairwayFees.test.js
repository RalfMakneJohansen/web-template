import { saleBreakdown, isShipped, FREIGHT_SUBUNITS } from './fairwayFees';

describe('saleBreakdown', () => {
  it('gives the seller the whole price and adds fee and freight for the buyer', () => {
    // 1.200 kr. shipped: 59,88 kr. fee, 50 kr. freight — the same total the
    // listing page shows from the real line items
    expect(saleBreakdown(120000, 'own')).toEqual({
      price: 120000,
      buyerFee: 5988,
      freight: FREIGHT_SUBUNITS,
      buyerTotal: 130988,
      sellerPayout: 120000,
    });
  });

  it('charges the same freight for a Fairway box', () => {
    expect(saleBreakdown(120000, 'box').freight).toBe(5000);
  });

  it('charges no freight for a meetup', () => {
    const b = saleBreakdown(120000, 'meetup');
    expect(b.freight).toBe(0);
    expect(b.buyerTotal).toBe(125988);
  });

  it('treats an unknown shipping choice as shipped', () => {
    expect(saleBreakdown(10000).freight).toBe(5000);
    expect(isShipped(undefined)).toBe(true);
  });

  it('never goes negative on bad input', () => {
    expect(saleBreakdown(-5, 'own').price).toBe(0);
    expect(saleBreakdown('abc', 'own').price).toBe(0);
  });
});
