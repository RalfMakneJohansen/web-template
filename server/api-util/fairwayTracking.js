/**
 * FAIRWAY: the server's side of track & trace — what may be written to an
 * order's metadata.shipment / metadata.boxShipment.
 *
 * Mirrors src/util/fairwayTracking.js (carriers, statuses, number format);
 * src/util/fairwayTracking.test.js pins the two lists together.
 */

const CARRIER_KEYS = ['gls', 'postnord', 'dao', 'bring', 'dhl'];
const SHIPMENT_STATUSES = ['label_created', 'in_transit', 'ready_for_pickup', 'delivered'];
const SHIPMENT_EXCEPTION = 'exception';
const TRACKING_NUMBER = /^[A-Za-z0-9-]{6,40}$/;

const normaliseTrackingNumber = value =>
  (value || '')
    .toString()
    .replace(/\s+/g, '')
    .toUpperCase();

const cleanText = (value, max) =>
  typeof value === 'string' && value.trim() ? value.trim().slice(0, max) : null;

/**
 * Validates and tidies a shipment before it is stored. Throws an Error with
 * status 400 when something required is wrong, so callers can pass it on.
 *
 * @param {Object} input { carrier, trackingNumber, trackingUrl?, status?, events? }
 * @returns {Object} the shipment to store, stamped with updatedAt
 */
const buildShipment = input => {
  const fail = message => {
    const error = new Error(message);
    error.status = 400;
    error.statusText = message;
    error.data = {};
    throw error;
  };
  const { carrier, trackingUrl, status, events } = input || {};
  const trackingNumber = normaliseTrackingNumber(input?.trackingNumber);

  if (!CARRIER_KEYS.includes(carrier)) {
    fail(`Unknown carrier. Use one of: ${CARRIER_KEYS.join(', ')}.`);
  }
  if (!TRACKING_NUMBER.test(trackingNumber)) {
    fail('Tracking number must be 6–40 letters, digits or dashes.');
  }
  if (status != null && !SHIPMENT_STATUSES.includes(status) && status !== SHIPMENT_EXCEPTION) {
    fail(`Unknown status. Use one of: ${[...SHIPMENT_STATUSES, SHIPMENT_EXCEPTION].join(', ')}.`);
  }

  const url = typeof trackingUrl === 'string' && /^https:\/\/\S+$/.test(trackingUrl);
  const cleanEvents = Array.isArray(events)
    ? events
        .map(e => ({
          at: cleanText(e?.at, 40),
          text: cleanText(e?.text, 200),
          location: cleanText(e?.location, 80),
        }))
        .filter(e => e.text)
        .slice(0, 20)
    : undefined;

  return {
    carrier,
    trackingNumber,
    ...(url ? { trackingUrl: trackingUrl.slice(0, 500) } : {}),
    status: status || 'label_created',
    ...(cleanEvents ? { events: cleanEvents } : {}),
    updatedAt: new Date().toISOString(),
  };
};

module.exports = {
  CARRIER_KEYS,
  SHIPMENT_STATUSES,
  SHIPMENT_EXCEPTION,
  TRACKING_NUMBER,
  normaliseTrackingNumber,
  buildShipment,
};
