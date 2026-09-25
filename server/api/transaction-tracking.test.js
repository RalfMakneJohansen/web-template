jest.mock('../api-util/integrationApi', () => ({
  updateTransactionMetadata: jest.fn(),
}));

const mockSdk = {
  currentUser: { show: jest.fn() },
  transactions: { show: jest.fn() },
};

jest.mock('../api-util/sdk', () => ({
  getSdk: () => mockSdk,
  serialize: data => JSON.stringify(data),
  handleError: (res, error) => res.status(error.status || 500).send(error.message),
}));

const integrationApi = require('../api-util/integrationApi');
const transactionTracking = require('./transaction-tracking');

const SELLER = 'seller-uuid';

const txResponse = (overrides = {}) => ({
  data: {
    data: {
      id: { uuid: 'tx-uuid' },
      attributes: {
        lastTransition: 'transition/confirm-payment',
        protectedData: { deliveryMethod: 'shipping' },
        ...overrides,
      },
      relationships: { provider: { data: { id: { uuid: SELLER } } } },
    },
  },
});

const call = (userId, body) =>
  new Promise(resolve => {
    mockSdk.currentUser.show.mockResolvedValue({ data: { data: { id: { uuid: userId } } } });
    const res = {
      code: 200,
      status(c) {
        this.code = c;
        return this;
      },
      set() {
        return this;
      },
      send(payload) {
        this.payload = payload;
        return this;
      },
      end() {
        resolve(this);
      },
    };
    const originalSend = res.send;
    res.send = function(payload) {
      originalSend.call(this, payload);
      if (this.code !== 200) resolve(this);
      return this;
    };
    transactionTracking({ body }, res);
  });

const body = { txId: 'tx-uuid', carrier: 'gls', trackingNumber: 'GLS 123456' };

describe('transaction tracking', () => {
  beforeEach(() => {
    mockSdk.transactions.show.mockResolvedValue(txResponse());
    integrationApi.updateTransactionMetadata.mockResolvedValue({});
  });

  afterEach(() => jest.clearAllMocks());

  it('lets the seller add the number from their label', async () => {
    const res = await call(SELLER, body);
    expect(res.code).toBe(200);
    const [id, metadata] = integrationApi.updateTransactionMetadata.mock.calls[0];
    expect(id).toBe('tx-uuid');
    expect(metadata.shipment).toMatchObject({
      carrier: 'gls',
      trackingNumber: 'GLS123456',
      status: 'label_created',
    });
  });

  it('refuses the buyer and anyone else', async () => {
    const res = await call('buyer-uuid', body);
    expect(res.code).toBe(403);
    expect(integrationApi.updateTransactionMetadata).not.toHaveBeenCalled();
  });

  it('refuses once the order has moved on', async () => {
    mockSdk.transactions.show.mockResolvedValue(
      txResponse({ lastTransition: 'transition/mark-delivered' })
    );
    expect((await call(SELLER, body)).code).toBe(403);
  });

  it('refuses pickup orders', async () => {
    mockSdk.transactions.show.mockResolvedValue(
      txResponse({ protectedData: { deliveryMethod: 'pickup' } })
    );
    expect((await call(SELLER, body)).code).toBe(403);
  });

  it('rejects a malformed number', async () => {
    expect((await call(SELLER, { ...body, trackingNumber: '12' })).code).toBe(400);
  });
});
