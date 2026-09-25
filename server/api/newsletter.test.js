const newsletter = require('./newsletter');

const call = (body, ip = '1.2.3.4') =>
  new Promise(resolve => {
    const res = {
      code: 200,
      status(c) {
        this.code = c;
        return this;
      },
      json(payload) {
        resolve({ status: this.code, body: payload });
        return this;
      },
    };
    newsletter({ body, ip }, res);
  });

describe('newsletter sign-up', () => {
  const realFetch = global.fetch;

  beforeEach(() => {
    newsletter._reset();
    process.env.MAILCHIMP_API_KEY = 'key123-us21';
    process.env.MAILCHIMP_LIST_ID = 'list42';
    global.fetch = jest.fn(() => Promise.resolve({ ok: true, json: () => Promise.resolve({}) }));
  });

  afterEach(() => {
    delete process.env.MAILCHIMP_API_KEY;
    delete process.env.MAILCHIMP_LIST_ID;
    global.fetch = realFetch;
  });

  it('adds the address as pending, so Mailchimp asks for confirmation', async () => {
    const r = await call({ email: ' Ole@Golf.dk ' });
    expect(r).toEqual({ status: 200, body: { ok: true } });
    const [url, options] = global.fetch.mock.calls[0];
    expect(url).toMatch(
      /^https:\/\/us21\.api\.mailchimp\.com\/3\.0\/lists\/list42\/members\/[0-9a-f]{32}$/
    );
    expect(options.method).toBe('PUT');
    expect(JSON.parse(options.body)).toMatchObject({
      email_address: 'ole@golf.dk',
      status_if_new: 'pending',
    });
  });

  it('rejects a malformed address without calling Mailchimp', async () => {
    expect((await call({ email: 'not-an-email' })).status).toBe(400);
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('quietly accepts bots that fill the hidden field', async () => {
    const r = await call({ email: 'bot@spam.dk', company: 'ACME' });
    expect(r.status).toBe(200);
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('limits repeated attempts', async () => {
    for (let i = 0; i < 5; i++) {
      await call({ email: `a${i}@golf.dk` });
    }
    expect((await call({ email: 'a6@golf.dk' })).status).toBe(429);
  });

  it('says it is not set up without Mailchimp keys', async () => {
    delete process.env.MAILCHIMP_API_KEY;
    const r = await call({ email: 'ole@golf.dk' });
    expect(r).toEqual({ status: 503, body: { error: 'not-configured' } });
  });
});
