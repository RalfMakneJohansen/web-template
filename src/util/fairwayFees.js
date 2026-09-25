/**
 * FAIRWAY: what a sale costs each side, and how the parcel travels.
 *
 * The seller pays nothing: no listing fee, no commission, no box. The buyer
 * pays the price, a flat freight charge when the item is shipped, and our fee
 * on top of the price. These figures are shown to users before they commit, so
 * they must match what is actually charged:
 *
 * - BUYER_FEE_RATE matches the customer commission set in Console
 *   (Monetization → Commission, 4.99%), which the line items use.
 * - FREIGHT_SUBUNITS matches FAIRWAY_FLAT_SHIPPING in server/api-util/lineItems.js
 *   and FREIGHT_SUBUNITS in EditListingShippingPanel.
 *
 * Amounts are in subunits (øre), like the SDK's Money.
 */

export const BUYER_FEE_RATE = 0.0499;
export const FREIGHT_SUBUNITS = 5000;

/**
 * The three ways a listing can reach the buyer, as stored in
 * publicData.shipment_type. Delivery times are working days from purchase.
 *
 * - own: the seller packs in their own box; we send a label. 2–3 days.
 * - box: we send the seller a box and a label first, so it takes longer. 4–6 days.
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
 * @returns {{ price: number, buyerFee: number, freight: number, buyerTotal: number, sellerPayout: number }}
 */
export const saleBreakdown = (priceSubunits, shipmentType) => {
  const price = Math.max(0, Math.round(Number(priceSubunits) || 0));
  const buyerFee = Math.round(price * BUYER_FEE_RATE);
  const freight = isShipped(shipmentType) ? FREIGHT_SUBUNITS : 0;
  return {
    price,
    buyerFee,
    freight,
    buyerTotal: price + buyerFee + freight,
    sellerPayout: price,
  };
};
