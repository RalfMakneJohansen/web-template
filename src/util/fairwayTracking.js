/**
 * FAIRWAY: track & trace on an order.
 *
 * Tracking lives in the transaction's metadata, which only the backend can
 * write (server/api/transaction-tracking.js for a seller typing in the number
 * from their label, server/api/shipping-webhook.js for the freight
 * automation). Both parties read it on the order page:
 *
 *   metadata.shipment    – the parcel from seller to buyer
 *   metadata.boxShipment – the Fairway box on its way to the seller
 *
 * Each is { carrier, trackingNumber, trackingUrl?, status?, updatedAt?, events? }.
 * The carrier and status lists are repeated in server/api-util/fairwayTracking.js;
 * fairwayTracking.test.js pins the two together.
 */

// Carriers Shipmondo books in Denmark, with their public tracking pages.
export const CARRIERS = {
  gls: {
    name: 'GLS',
    trackingUrl: n => `https://gls-group.com/DK/da/find-pakke?match=${n}`,
  },
  postnord: {
    name: 'PostNord',
    trackingUrl: n => `https://tracking.postnord.com/dk/?id=${n}`,
  },
  dao: {
    name: 'DAO',
    trackingUrl: n => `https://www.dao.as/privat/find-din-pakke?stregkode=${n}`,
  },
  bring: {
    name: 'Bring',
    trackingUrl: n => `https://tracking.bring.dk/tracking/${n}`,
  },
  dhl: {
    name: 'DHL',
    trackingUrl: n =>
      `https://www.dhl.com/dk-da/home/tracking/tracking-parcel.html?submit=1&tracking-id=${n}`,
  },
};

export const CARRIER_KEYS = Object.keys(CARRIERS);

/**
 * Where a parcel is, in the order it gets there. 'exception' (lost, damaged,
 * returned) can happen at any point and is shown on its own.
 */
export const SHIPMENT_STATUSES = ['label_created', 'in_transit', 'ready_for_pickup', 'delivered'];
export const SHIPMENT_EXCEPTION = 'exception';

// Letters, digits and dashes, as printed on Danish carriers' labels.
export const TRACKING_NUMBER = /^[A-Za-z0-9-]{6,40}$/;

export const normaliseTrackingNumber = value =>
  (value || '')
    .toString()
    .replace(/\s+/g, '')
    .toUpperCase();

export const isValidTrackingNumber = value => TRACKING_NUMBER.test(normaliseTrackingNumber(value));

// Only links to https pages are followed; anything else falls back to the
// carrier's own tracking page.
const safeUrl = url => (typeof url === 'string' && /^https:\/\/[^\s]+$/.test(url) ? url : null);

/**
 * The tracking link for a shipment: the one the automation stored, or the
 * carrier's public tracking page for the number.
 *
 * @param {Object} shipment
 * @returns {string|null}
 */
export const trackingUrlFor = shipment => {
  const { carrier, trackingNumber, trackingUrl } = shipment || {};
  const stored = safeUrl(trackingUrl);
  if (stored) {
    return stored;
  }
  const c = CARRIERS[carrier];
  return c && trackingNumber ? c.trackingUrl(encodeURIComponent(trackingNumber)) : null;
};

/**
 * A shipment from the order's metadata, tidied up for display, or null when
 * there is nothing to show.
 *
 * Orders from before metadata.boxShipment existed carry the box leg as
 * boxDispatchedAt / boxTracking; those are read as a box in transit.
 *
 * @param {Object} metadata the transaction's metadata
 * @param {'parcel'|'box'} [leg]
 * @returns {Object|null} { carrier, carrierName, trackingNumber, trackingUrl, status, updatedAt, events }
 */
export const shipmentFrom = (metadata, leg = 'parcel') => {
  const raw =
    leg === 'box'
      ? metadata?.boxShipment ||
        (metadata?.boxDispatchedAt || metadata?.boxTracking
          ? {
              trackingNumber: metadata.boxTracking,
              status: 'in_transit',
              updatedAt: metadata.boxDispatchedAt,
            }
          : null)
      : metadata?.shipment;

  if (!raw || typeof raw !== 'object') {
    return null;
  }
  const trackingNumber = raw.trackingNumber ? String(raw.trackingNumber) : null;
  const status =
    SHIPMENT_STATUSES.includes(raw.status) || raw.status === SHIPMENT_EXCEPTION
      ? raw.status
      : trackingNumber
      ? 'label_created'
      : null;
  if (!trackingNumber && !status) {
    return null;
  }
  const carrier = CARRIERS[raw.carrier] ? raw.carrier : null;
  const events = Array.isArray(raw.events)
    ? raw.events
        .filter(e => e && typeof e.text === 'string')
        .map(e => ({ at: e.at || null, text: e.text, location: e.location || null }))
        .slice(0, 20)
    : [];

  return {
    carrier,
    carrierName: carrier ? CARRIERS[carrier].name : null,
    trackingNumber,
    trackingUrl: trackingUrlFor({ carrier, trackingNumber, trackingUrl: raw.trackingUrl }),
    status,
    updatedAt: raw.updatedAt || null,
    events,
  };
};

/**
 * How far along the three visible steps a status is: 0 label, 1 on its way,
 * 2 delivered. A parcel waiting in a parcel shop is still "on its way" for the
 * steps, with its own note.
 *
 * @param {string} status
 * @returns {number}
 */
export const stepIndexFor = status =>
  status === 'delivered' ? 2 : status === 'in_transit' || status === 'ready_for_pickup' ? 1 : 0;
