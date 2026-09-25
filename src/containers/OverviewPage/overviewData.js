import { getProcess } from '../../transactions/transaction';
import { types as sdkTypes } from '../../util/sdkLoader';

const { Money } = sdkTypes;

const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;

// The seller has 14 days from payment to get the parcel delivered, the buyer
// 48 hours from delivery to check it (ext/transaction-processes/default-purchase).
export const SHIP_WITHIN_MS = 14 * DAY_MS;
export const INSPECT_WITHIN_MS = 48 * HOUR_MS;

const DONE_STATES = [
  'received',
  'completed',
  'reviewed',
  'reviewed-by-customer',
  'reviewed-by-provider',
];

/**
 * The process state a transaction is in, e.g. 'purchased', or null for a
 * process this app does not know.
 */
export const txStateOf = tx => {
  try {
    return getProcess(tx?.attributes?.processName).getState(tx) || null;
  } catch (e) {
    return null;
  }
};

const lastChange = tx => new Date(tx?.attributes?.lastTransitionedAt || 0).getTime();

/**
 * What the person has to do now, most urgent first.
 *
 * - send: a sale is paid and waiting for the seller; due 14 days after payment
 * - approve: a purchase is delivered; the buyer has 48 hours to check it
 * - onItsWay: a purchase is paid and on its way (nothing to do, but worth seeing)
 * - awaitingBuyer: a sale is delivered and the buyer is checking it
 * - dispute: an order someone has reported a problem with
 *
 * @param {{ sales: Array, orders: Array }} txs
 * @returns {Array<{ kind: string, role: 'provider'|'customer', tx: Object, deadline: number|null }>}
 */
export const actionItems = ({ sales = [], orders = [] }) => {
  const items = [];
  sales.forEach(tx => {
    const state = txStateOf(tx);
    if (state === 'purchased') {
      items.push({ kind: 'send', role: 'provider', tx, deadline: lastChange(tx) + SHIP_WITHIN_MS });
    } else if (state === 'delivered') {
      items.push({
        kind: 'awaitingBuyer',
        role: 'provider',
        tx,
        deadline: lastChange(tx) + INSPECT_WITHIN_MS,
      });
    } else if (state === 'disputed') {
      items.push({ kind: 'dispute', role: 'provider', tx, deadline: null });
    }
  });
  orders.forEach(tx => {
    const state = txStateOf(tx);
    if (state === 'delivered') {
      items.push({
        kind: 'approve',
        role: 'customer',
        tx,
        deadline: lastChange(tx) + INSPECT_WITHIN_MS,
      });
    } else if (state === 'purchased') {
      items.push({ kind: 'onItsWay', role: 'customer', tx, deadline: null });
    } else if (state === 'disputed') {
      items.push({ kind: 'dispute', role: 'customer', tx, deadline: null });
    }
  });

  // Things you must do before things you're waiting for; then by deadline.
  const weight = { send: 0, approve: 0, dispute: 1, awaitingBuyer: 2, onItsWay: 2 };
  return items.sort(
    (a, b) => weight[a.kind] - weight[b.kind] || (a.deadline || Infinity) - (b.deadline || Infinity)
  );
};

/**
 * The headline numbers: listings, completed sales and purchases, and what
 * completed sales have paid out.
 */
export const overviewStats = ({ sales = [], orders = [], listingCount = 0 }) => {
  const doneSales = sales.filter(tx => DONE_STATES.includes(txStateOf(tx)));
  const doneOrders = orders.filter(tx => DONE_STATES.includes(txStateOf(tx)));
  const payouts = doneSales.map(tx => tx.attributes.payoutTotal).filter(Boolean);
  const currency = payouts[0]?.currency;
  const earned = currency
    ? new Money(
        payouts.filter(m => m.currency === currency).reduce((sum, m) => sum + m.amount, 0),
        currency
      )
    : null;

  return {
    listings: listingCount,
    sold: doneSales.length,
    bought: doneOrders.length,
    earned,
  };
};

/**
 * The latest trades on both sides, newest first.
 */
export const recentTrades = ({ sales = [], orders = [] }, limit = 5) =>
  [...sales.map(tx => ({ tx, role: 'provider' })), ...orders.map(tx => ({ tx, role: 'customer' }))]
    .sort((a, b) => lastChange(b.tx) - lastChange(a.tx))
    .slice(0, limit);

/**
 * A short status for a trade, as a translation key suffix.
 */
export const tradeStatus = (tx, role) => {
  const state = txStateOf(tx);
  if (DONE_STATES.includes(state)) {
    return 'done';
  }
  if (state === 'purchased') {
    return role === 'provider' ? 'toSend' : 'onItsWay';
  }
  if (['delivered', 'disputed', 'canceled', 'inquiry'].includes(state)) {
    return state;
  }
  return 'other';
};

/**
 * Time left until a deadline, rounded the way people say it: days while there
 * are more than two, then hours. Negative is "overdue".
 *
 * @returns {{ unit: 'days'|'hours'|'overdue', value: number }}
 */
export const timeLeft = (deadline, now = Date.now()) => {
  const ms = deadline - now;
  if (ms <= 0) {
    return { unit: 'overdue', value: 0 };
  }
  if (ms > 2 * DAY_MS) {
    return { unit: 'days', value: Math.floor(ms / DAY_MS) };
  }
  return { unit: 'hours', value: Math.max(1, Math.floor(ms / HOUR_MS)) };
};
