/**
 * FAIRWAY: what a sale costs each side, and how the parcel travels.
 *
 * The seller pays no listing fee and no commission. If they ask us to send
 * them a box, the box costs BOX_FEE_SUBUNITS, taken from the payout when the
 * item sells. The buyer pays the price, a flat freight charge when the item
 * is shipped, and our fee on top of the price. These figures are shown to
 * users before they commit, so they must match what is actually charged:
 *
 * - BUYER_FEE_RATE matches the customer commission set in Console
 *   (Monetization → Commission, 4.99%), which the line items use.
 * - FREIGHT_SUBUNITS matches FAIRWAY_FLAT_SHIPPING and BOX_FEE_SUBUNITS matches
 *   FAIRWAY_BOX_FEE in server/api-util/lineItems.js. lineItems.test.js pins both.
 *
 * Amounts are in subunits (øre), like the SDK's Money.
 */

export const BUYER_FEE_RATE = 0.0499;
export const FREIGHT_SUBUNITS = 5000;
export const BOX_FEE_SUBUNITS = 5900;

/**
 * The three ways a listing can reach the buyer, as stored in
 * publicData.shipment_type. Delivery times are working days from purchase.
 *
 * - own: the seller packs in their own box; we send a label or QR code, and
 *   they drop the parcel at a parcel shop. 2–3 days. Free for the seller.
 * - box: we send the seller a box with the label or QR code first, so it
 *   takes longer. 4–6 days. The box costs the seller 59 kr at the sale.
 * - meetup: collected in person; no freight, no label. Paid through Fairway
 *   like any other order, and released when the buyer confirms the handover.
 */
export const SHIPMENT_TYPES = ['own', 'box', 'meetup'];

export const DELIVERY_DAYS = {
  own: { min: 2, max: 3 },
  box: { min: 4, max: 6 },
  meetup: null,
};

export const isShipped = shipmentType => shipmentType !== 'meetup';

/**
 * The money on a listing, for a given price and shipping choice.
 *
 * @param {number} priceSubunits listing price in øre
 * @param {string} [shipmentType] one of SHIPMENT_TYPES; shipped when unknown
 * @returns {{ price: number, buyerFee: number, freight: number, boxFee: number, buyerTotal: number, sellerPayout: number }}
 */
export const saleBreakdown = (priceSubunits, shipmentType) => {
  const price = Math.max(0, Math.round(Number(priceSubunits) || 0));
  const buyerFee = Math.round(price * BUYER_FEE_RATE);
  const freight = isShipped(shipmentType) ? FREIGHT_SUBUNITS : 0;
  // Never more than the price: a payout can't go below zero.
  const boxFee = shipmentType === 'box' ? Math.min(BOX_FEE_SUBUNITS, price) : 0;
  return {
    price,
    buyerFee,
    freight,
    boxFee,
    buyerTotal: price + buyerFee + freight,
    sellerPayout: price - boxFee,
  };
};
