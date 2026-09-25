const crypto = require('crypto');

/**
 * FAIRWAY: newsletter sign-up from the footer.
 *
 * Adds the address to a Mailchimp audience as "pending": Mailchimp mails a
 * confirmation link, and only a confirmed address gets newsletters (double
 * opt-in, which is what Danish marketing law expects). Someone already on the
 * list is left as they are.
 *
 *   MAILCHIMP_API_KEY   e.g. "abc123…-us21" (the part after the dash is the data centre)
 *   MAILCHIMP_LIST_ID   the audience ID (Audience → Settings → Audience name and defaults)
 *
 * Without them the endpoint answers 503 and the form says sign-up opens soon.
 * Body (transit or JSON): { email, company } — `company` is a hidden field
 * people never fill in; bots do, and are quietly told it worked.
 */

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// Each address and each IP may try a few times per window. Enough for a typo,
// not enough to use the form to mail confirmation links to strangers.
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 5;
const attempts = new Map();

const tooMany = key => {
  const now = Date.now();
  const recent = (attempts.get(key) || []).filter(t => now - t < WINDOW_MS);
  recent.push(now);
  attempts.set(key, recent);
  if (attempts.size > 5000) {
    // Keep memory bounded: drop the oldest entries.
    Array.from(attempts.keys())
      .slice(0, 1000)
      .forEach(k => attempts.delete(k));
  }
  return recent.length > MAX_PER_WINDOW;
};

const mailchimp = () => {
  const apiKey = process.env.MAILCHIMP_API_KEY;
  const listId = process.env.MAILCHIMP_LIST_ID;
  const dc = apiKey && apiKey.split('-')[1];
  return apiKey && listId && dc ? { apiKey, listId, dc } : null;
};

const subscribe = ({ apiKey, listId, dc }, email) => {
  const hash = crypto
    .createHash('md5')
    .update(email)
    .digest('hex');
  return fetch(`https://${dc}.api.mailchimp.com/3.0/lists/${listId}/members/${hash}`, {
    method: 'PUT',
    headers: {
      Authorization: `Basic ${Buffer.from(`fairway:${apiKey}`).toString('base64')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email_address: email,
      status_if_new: 'pending',
      language: 'da',
    }),
  }).then(res => {
    if (!res.ok) {
      return res
        .json()
        .catch(() => ({}))
        .then(json => {
          const error = new Error(json.title || `Mailchimp ${res.status}`);
          // Mailchimp refuses fake or banned addresses with 400.
          error.status = res.status === 400 ? 400 : 502;
          throw error;
        });
    }
    return true;
  });
};

module.exports = (req, res) => {
  const { email: rawEmail, company } = req.body || {};
  const email = typeof rawEmail === 'string' ? rawEmail.trim().toLowerCase() : '';

  if (company) {
    // A bot filled the hidden field.
    res.status(200).json({ ok: true });
    return;
  }
  if (!EMAIL.test(email) || email.length > 254) {
    res.status(400).json({ error: 'invalid-email' });
    return;
  }
  if (tooMany(`ip:${req.ip}`) || tooMany(`email:${email}`)) {
    res.status(429).json({ error: 'too-many' });
    return;
  }

  const provider = mailchimp();
  if (!provider) {
    res.status(503).json({ error: 'not-configured' });
    return;
  }

  subscribe(provider, email)
    .then(() => res.status(200).json({ ok: true }))
    .catch(e => {
      console.error('newsletter-subscribe-failed', e.message);
      res.status(e.status || 502).json({ error: e.status === 400 ? 'invalid-email' : 'failed' });
    });
};

// For tests
module.exports._reset = () => attempts.clear();
