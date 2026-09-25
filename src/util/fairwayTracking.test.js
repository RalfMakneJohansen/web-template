import {
  CARRIER_KEYS,
  SHIPMENT_STATUSES,
  TRACKING_NUMBER,
  isValidTrackingNumber,
  normaliseTrackingNumber,
  shipmentFrom,
  stepIndexFor,
  trackingUrlFor,
} from './fairwayTracking';

const server = require('../../server/api-util/fairwayTracking');

describe('fairwayTracking', () => {
  it('keeps carriers, statuses and the number format in step with the server', () => {
    expect(CARRIER_KEYS).toEqual(server.CARRIER_KEYS);
    expect(SHIPMENT_STATUSES).toEqual(server.SHIPMENT_STATUSES);
    expect(TRACKING_NUMBER.source).toBe(server.TRACKING_NUMBER.source);
  });

  it('tidies tracking numbers the way labels print them', () => {
    expect(normaliseTrackingNumber(' 0037 0712 34ab ')).toBe('0037071234AB');
    expect(isValidTrackingNumber('0037 0712 3456')).toBe(true);
    expect(isValidTrackingNumber('12')).toBe(false);
    expect(isValidTrackingNumber('abc<script>')).toBe(false);
  });

  it('links to the carrier when no link is stored', () => {
    expect(trackingUrlFor({ carrier: 'gls', trackingNumber: 'AB123456' })).toBe(
      'https://gls-group.com/DK/da/find-pakke?match=AB123456'
    );
    expect(trackingUrlFor({ carrier: 'unknown', trackingNumber: 'AB123456' })).toBeNull();
  });

  it('only follows https links', () => {
    const base = { carrier: 'dao', trackingNumber: 'AB123456' };
    expect(trackingUrlFor({ ...base, trackingUrl: 'https://track.example/AB' })).toBe(
      'https://track.example/AB'
    );
    expect(trackingUrlFor({ ...base, trackingUrl: 'javascript:alert(1)' })).toContain('dao.as');
  });

  it('reads the parcel from metadata', () => {
    const s = shipmentFrom({
      shipment: { carrier: 'postnord', trackingNumber: 'PN123456', status: 'in_transit' },
    });
    expect(s).toMatchObject({
      carrierName: 'PostNord',
      trackingNumber: 'PN123456',
      status: 'in_transit',
    });
    expect(s.trackingUrl).toContain('PN123456');
  });

  it('treats a number without a status as a label that is ready', () => {
    expect(shipmentFrom({ shipment: { trackingNumber: 'X1234567' } }).status).toBe('label_created');
  });

  it('reads the box leg, also from older orders', () => {
    expect(shipmentFrom({ boxTracking: 'BOX12345', boxDispatchedAt: '2026-09-25' }, 'box'))
      .toMatchObject({ trackingNumber: 'BOX12345', status: 'in_transit' });
    expect(shipmentFrom({}, 'box')).toBeNull();
  });

  it('shows nothing for an order without tracking', () => {
    expect(shipmentFrom({})).toBeNull();
    expect(shipmentFrom(undefined)).toBeNull();
  });

  it('places statuses on the three steps', () => {
    expect(stepIndexFor('label_created')).toBe(0);
    expect(stepIndexFor('in_transit')).toBe(1);
    expect(stepIndexFor('ready_for_pickup')).toBe(1);
    expect(stepIndexFor('delivered')).toBe(2);
  });
});
