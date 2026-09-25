import { types as sdkTypes } from '../../util/sdkLoader';

import {
  actionItems,
  overviewStats,
  recentTrades,
  timeLeft,
  tradeStatus,
  SHIP_WITHIN_MS,
  INSPECT_WITHIN_MS,
} from './overviewData';

const { Money, UUID } = sdkTypes;

const tx = (id, lastTransition, at, payout = 100000) => ({
  id: new UUID(id),
  type: 'transaction',
  attributes: {
    processName: 'default-purchase',
    lastTransition,
    lastTransitionedAt: new Date(at),
    payoutTotal: new Money(payout, 'DKK'),
  },
});

const T0 = Date.UTC(2026, 8, 20, 12);

describe('overviewData', () => {
  it('asks the seller to send a paid order, due 14 days after payment', () => {
    const sale = tx('s1', 'transition/confirm-payment', T0);
    const [item] = actionItems({ sales: [sale] });
    expect(item).toMatchObject({ kind: 'send', role: 'provider' });
    expect(item.deadline).toBe(T0 + SHIP_WITHIN_MS);
  });

  it('asks the buyer to approve within 48 hours of delivery', () => {
    const order = tx('o1', 'transition/mark-delivered', T0);
    const [item] = actionItems({ orders: [order] });
    expect(item).toMatchObject({ kind: 'approve', role: 'customer' });
    expect(item.deadline).toBe(T0 + INSPECT_WITHIN_MS);
  });

  it('puts what you must do before what you are waiting for', () => {
    const items = actionItems({
      sales: [tx('s1', 'transition/mark-delivered', T0)],
      orders: [
        tx('o1', 'transition/confirm-payment', T0),
        tx('o2', 'transition/mark-delivered', T0),
      ],
    });
    expect(items.map(i => i.kind)).toEqual(['approve', 'awaitingBuyer', 'onItsWay']);
  });

  it('leaves finished and unknown trades out of the to-do list', () => {
    expect(actionItems({ sales: [tx('s1', 'transition/mark-received', T0)] })).toEqual([]);
    const unknown = { ...tx('x', 'transition/whatever', T0) };
    unknown.attributes.processName = 'some-other-process';
    expect(actionItems({ sales: [unknown] })).toEqual([]);
  });

  it('counts completed trades and adds up what was paid out', () => {
    const stats = overviewStats({
      sales: [
        tx('s1', 'transition/mark-received', T0, 120000),
        tx('s2', 'transition/auto-mark-received', T0, 80000),
        tx('s3', 'transition/confirm-payment', T0, 50000),
      ],
      orders: [tx('o1', 'transition/mark-received', T0)],
      listingCount: 4,
    });
    expect(stats.listings).toBe(4);
    expect(stats.sold).toBe(2);
    expect(stats.bought).toBe(1);
    expect(stats.earned).toEqual(new Money(200000, 'DKK'));
  });

  it('has no earnings before the first completed sale', () => {
    expect(overviewStats({}).earned).toBeNull();
  });

  it('lists the newest trades from both sides first', () => {
    const recent = recentTrades({
      sales: [tx('s1', 'transition/confirm-payment', T0)],
      orders: [tx('o1', 'transition/confirm-payment', T0 + 1000)],
    });
    expect(recent.map(r => r.role)).toEqual(['customer', 'provider']);
  });

  it('names statuses from each side', () => {
    const paid = tx('s1', 'transition/confirm-payment', T0);
    expect(tradeStatus(paid, 'provider')).toBe('toSend');
    expect(tradeStatus(paid, 'customer')).toBe('onItsWay');
    expect(tradeStatus(tx('s2', 'transition/mark-received', T0), 'provider')).toBe('done');
  });

  it('says time left in days, then hours', () => {
    expect(timeLeft(T0 + 5 * 24 * 3600e3, T0)).toEqual({ unit: 'days', value: 5 });
    expect(timeLeft(T0 + 30 * 3600e3, T0)).toEqual({ unit: 'hours', value: 30 });
    expect(timeLeft(T0 - 1, T0)).toEqual({ unit: 'overdue', value: 0 });
  });
});
