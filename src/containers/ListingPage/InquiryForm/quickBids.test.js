import { quickBids } from './InquiryForm';

describe('quickBids', () => {
  it('suggests bids 5, 10 and 15 % under the price, rounded to 50 kr.', () => {
    expect(quickBids(444400)).toEqual([
      { percent: 5, amount: 420000 },
      { percent: 10, amount: 400000 },
      { percent: 15, amount: 380000 },
    ]);
  });

  it('never suggests the asking price itself or the same amount twice', () => {
    const bids = quickBids(10000); // 100 kr.
    expect(bids.every(b => b.amount < 10000)).toBe(true);
    expect(new Set(bids.map(b => b.amount)).size).toBe(bids.length);
  });

  it('suggests nothing without a price', () => {
    expect(quickBids(0)).toEqual([]);
  });
});
