const { getSdk, handleError, serialize } = require('../api-util/sdk');
const { buildShipment } = require('../api-util/fairwayTracking');
const integrationApi = require('../api-util/integrationApi');

// The order is paid and waiting to be sent: the only time a seller adds or
// corrects the parcel's tracking number. Once it is delivered, the number is
// settled.
const PURCHASED_TRANSITION = 'transition/confirm-payment';

const forbidden = message => {
  const error = new Error(message);
  error.status = 403;
  error.statusText = message;
  error.data = {};
  return error;
};

/**
 * FAIRWAY: a seller adds the tracking number from their label to an order, so
 * the buyer can follow the parcel.
 *
 * The seller's own session proves who they are and that the order is theirs;
 * the write itself goes through the Integration API, because metadata is
 * read-only to users. Body (transit): { txId, carrier, trackingNumber }.
 */
module.exports = (req, res) => {
  const { txId, carrier, trackingNumber } = req.body || {};
  const sdk = getSdk(req, res);

  Promise.all([sdk.currentUser.show(), sdk.transactions.show({ id: txId, include: ['provider'] })])
    .then(([userRes, txRes]) => {
      const currentUserId = userRes.data.data.id.uuid;
      const tx = txRes.data.data;
      const providerId = tx.relationships?.provider?.data?.id?.uuid;
      const { lastTransition, protectedData } = tx.attributes;

      if (providerId !== currentUserId) {
        throw forbidden('Only the seller can add tracking to this order.');
      }
      if (lastTransition !== PURCHASED_TRANSITION) {
        throw forbidden('Tracking can only be added while the order is waiting to be sent.');
      }
      if (protectedData?.deliveryMethod !== 'shipping') {
        throw forbidden('This order is not shipped.');
      }

      const shipment = buildShipment({ carrier, trackingNumber, status: 'label_created' });
      return integrationApi
        .updateTransactionMetadata(tx.id.uuid, { shipment })
        .then(() => shipment);
    })
    .then(shipment => {
      res
        .status(200)
        .set('Content-Type', 'application/transit+json')
        .send(serialize({ data: { shipment } }))
        .end();
    })
    .catch(e => {
      handleError(res, e);
    });
};
