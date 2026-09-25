jest.mock('../api-util/integrationApi', () => ({
  showTransaction: jest.fn(),
  updateTransactionMetadata: jest.fn(),
  transitionTransaction: jest.fn(),
}));

const integrationApi = require('../api-util/integrationApi');
const shippingWebhook = require('./shipping-webhook');
const { buildShipment } = require('../api-util/fairwayTracking');

const TX = '6a0b9a4e-1234-4c5d-8e9f-0123456789ab';

const call = ({ secret = 'shh', body }) =>
  new Promise(resolve => {
    const req = { body, get: h => (h === 'x-fairway-secret' ? secret : undefined) };
    const res = {
      statusCode: 200,
      status(code) {
        this.statusCode = code;
        return this;
      },
      json(payload) {
        resolve({ status: this.statusCode, body: payload });
        return this;
      },
    };
    shippingWebhook(req, res);
  });

describe('shipping webhook', () => {
  beforeEach(() => {
    process.env.FAIRWAY_SHIPPING_WEBHOOK_SECRET = 'shh';
    integrationApi.updateTransactionMetadata.mockResolvedValue({});
    integrationApi.transitionTransaction.mockResolvedValue({});
    integrationApi.showTransaction.mockResolvedValue({
      data: { attributes: { lastTransition: 'transition/confirm-payment' } },
    });
  });

  afterEach(() => {
    delete process.env.FAIRWAY_SHIPPING_WEBHOOK_SECRET;
    jest.clearAllMocks();
  });

  const parcel = { carrier: 'gls', trackingNumber: 'GLS123456' };

  it('refuses a wrong secret', async () => {
    const r = await call({ secret: 'nope', body: { transactionId: TX, ...parcel } });
    expect(r.status).toBe(401);
    expect(integrationApi.updateTransactionMetadata).not.toHaveBeenCalled();
  });

  it('is closed until a secret is configured', async () => {
    delete process.env.FAIRWAY_SHIPPING_WEBHOOK_SECRET;
    const r = await call({ body: { transactionId: TX, ...parcel } });
    expect(r.status).toBe(503);
  });

  it('rejects bad input', async () => {
    expect((await call({ body: { transactionId: 'x', ...parcel } })).status).toBe(400);
    expect(
      (await call({ body: { transactionId: TX, carrier: 'ups', trackingNumber: 'X1234567' } }))
        .status
    ).toBe(400);
  });

  it('stores the parcel on the order', async () => {
    const r = await call({ body: { transactionId: TX, ...parcel, status: 'in_transit' } });
    expect(r).toEqual({ status: 200, body: { ok: true, markedDelivered: false } });
    const [id, metadata] = integrationApi.updateTransactionMetadata.mock.calls[0];
    expect(id).toBe(TX);
    expect(metadata.shipment).toMatchObject({ ...parcel, status: 'in_transit' });
    expect(integrationApi.transitionTransaction).not.toHaveBeenCalled();
  });

  it('marks a waiting order delivered when the parcel arrives', async () => {
    const r = await call({ body: { transactionId: TX, ...parcel, status: 'delivered' } });
    expect(r.body.markedDelivered).toBe(true);
    expect(integrationApi.transitionTransaction).toHaveBeenCalledWith(
      TX,
      'transition/operator-mark-delivered'
    );
  });

  it('leaves an order alone that has already moved on', async () => {
    integrationApi.showTransaction.mockResolvedValue({
      data: { attributes: { lastTransition: 'transition/mark-delivered' } },
    });
    const r = await call({ body: { transactionId: TX, ...parcel, status: 'delivered' } });
    expect(r.body.markedDelivered).toBe(false);
    expect(integrationApi.transitionTransaction).not.toHaveBeenCalled();
  });

  it('writes the box leg where older order pages read it too', async () => {
    await call({ body: { transactionId: TX, leg: 'box', ...parcel, status: 'in_transit' } });
    const [, metadata] = integrationApi.updateTransactionMetadata.mock.calls[0];
    expect(metadata.boxShipment.trackingNumber).toBe('GLS123456');
    expect(metadata.boxTracking).toBe('GLS123456');
    expect(metadata.boxDispatchedAt).toBeTruthy();
  });
});

describe('buildShipment', () => {
  it('keeps only safe, bounded fields', () => {
    const s = buildShipment({
      carrier: 'dao',
      trackingNumber: ' dao 123456 ',
      trackingUrl: 'javascript:alert(1)',
      events: [{ text: 'x'.repeat(500), at: '2026-09-25' }, { text: '' }],
      extra: 'dropped',
    });
    expect(s.trackingNumber).toBe('DAO123456');
    expect(s.trackingUrl).toBeUndefined();
    expect(s.events).toHaveLength(1);
    expect(s.events[0].text).toHaveLength(200);
    expect(s.extra).toBeUndefined();
  });
});
