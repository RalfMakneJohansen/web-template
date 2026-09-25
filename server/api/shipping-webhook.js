const crypto = require('crypto');

const { buildShipment } = require('../api-util/fairwayTracking');
const integrationApi = require('../api-util/integrationApi');

const PURCHASED_TRANSITION = 'transition/confirm-payment';
const OPERATOR_MARK_DELIVERED = 'transition/operator-mark-delivered';

const secret = () => process.env.FAIRWAY_SHIPPING_WEBHOOK_SECRET;

// Constant-time comparison, so the secret can't be guessed byte by byte.
const secretMatches = given => {
  const expected = secret();
  if (!expected || typeof given !== 'string') {
    return false;
  }
  const a = Buffer.from(given);
  const b = Buffer.from(expected);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
};

/**
 * FAIRWAY: where the freight automation reports a parcel's progress.
 *
 * POST /api/shipping/webhook with header `x-fairway-secret` and JSON:
 *
 *   {
 *     "transactionId": "…",           // the Sharetribe order
 *     "leg": "parcel" | "box",         // parcel to the buyer, or box to the seller
 *     "carrier": "gls" | "postnord" | "dao" | "bring" | "dhl",
 *     "trackingNumber": "…",
 *     "trackingUrl": "https://…",      // optional
 *     "status": "label_created" | "in_transit" | "ready_for_pickup" | "delivered" | "exception",
 *     "events": [{ "at": "…", "text": "…", "location": "…" }]   // optional, newest first
 *   }
 *
 * The shipment is written to the order's metadata, where buyer and seller both
 * see it. When the parcel to the buyer is delivered and the order is still
 * waiting, the order is marked delivered for the seller — that starts the
 * buyer's 48 hours (docs/shipping-data.md).
 *
 * Shipmondo's own webhook format is translated into this in one place when it
 * is connected; anything that can POST JSON can use it meanwhile.
 */
module.exports = (req, res) => {
  if (!secret()) {
    res.status(503).json({ error: 'Webhook secret is not configured.' });
    return;
  }
  if (!secretMatches(req.get('x-fairway-secret'))) {
    res.status(401).json({ error: 'Invalid secret.' });
    return;
  }

  const { transactionId, leg = 'parcel', ...input } = req.body || {};
  if (typeof transactionId !== 'string' || !/^[0-9a-f-]{36}$/i.test(transactionId)) {
    res.status(400).json({ error: 'transactionId must be a transaction UUID.' });
    return;
  }
  if (!['parcel', 'box'].includes(leg)) {
    res.status(400).json({ error: 'leg must be "parcel" or "box".' });
    return;
  }

  let shipment;
  try {
    shipment = buildShipment(input);
  } catch (e) {
    res.status(e.status || 400).json({ error: e.message });
    return;
  }

  // Older order pages read the box leg from boxDispatchedAt / boxTracking.
  const metadata =
    leg === 'box'
      ? {
          boxShipment: shipment,
          boxTracking: shipment.trackingNumber,
          ...(shipment.status !== 'label_created' ? { boxDispatchedAt: shipment.updatedAt } : {}),
        }
      : { shipment };

  const markDeliveredMaybe = () => {
    if (leg !== 'parcel' || shipment.status !== 'delivered') {
      return Promise.resolve(false);
    }
    return integrationApi.showTransaction(transactionId).then(txRes => {
      const lastTransition = txRes?.data?.attributes?.lastTransition;
      if (lastTransition !== PURCHASED_TRANSITION) {
        return false;
      }
      return integrationApi
        .transitionTransaction(transactionId, OPERATOR_MARK_DELIVERED)
        .then(() => true);
    });
  };

  integrationApi
    .updateTransactionMetadata(transactionId, metadata)
    .then(markDeliveredMaybe)
    .then(markedDelivered => {
      res.status(200).json({ ok: true, markedDelivered });
    })
    .catch(e => {
      console.error('Shipping webhook failed:', e.message);
      res.status(e.status && e.status < 600 ? e.status : 500).json({ error: e.message });
    });
};
