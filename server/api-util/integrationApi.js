/**
 * FAIRWAY: a minimal Sharetribe Integration API client.
 *
 * Only the backend may write a transaction's metadata or act as the operator,
 * and that needs the Integration API. This covers the three calls the freight
 * flow uses — show, update_metadata and transition — over plain fetch, so no
 * extra SDK is bundled.
 *
 * Needs an Integration API application (Console → Advanced → Applications):
 *   SHARETRIBE_INTEGRATION_CLIENT_ID
 *   SHARETRIBE_INTEGRATION_CLIENT_SECRET
 * Without them isConfigured() is false and the tracking endpoints answer 503.
 */

const BASE_URL = process.env.REACT_APP_SHARETRIBE_SDK_BASE_URL || 'https://flex-api.sharetribe.com';

const clientId = () => process.env.SHARETRIBE_INTEGRATION_CLIENT_ID;
const clientSecret = () => process.env.SHARETRIBE_INTEGRATION_CLIENT_SECRET;

const isConfigured = () => !!(clientId() && clientSecret());

// One token is reused until shortly before it expires.
let cachedToken = null;

const apiError = (status, message, data) => {
  const error = new Error(message);
  error.status = status;
  error.statusText = message;
  error.data = data || {};
  return error;
};

const fetchToken = () => {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 60 * 1000) {
    return Promise.resolve(cachedToken.value);
  }
  const body = new URLSearchParams({
    client_id: clientId(),
    client_secret: clientSecret(),
    grant_type: 'client_credentials',
    scope: 'integ',
  });
  return fetch(`${BASE_URL}/v1/auth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', Accept: 'application/json' },
    body,
  }).then(res => {
    if (!res.ok) {
      throw apiError(502, `Integration API authentication failed (${res.status}).`);
    }
    return res.json().then(json => {
      cachedToken = {
        value: json.access_token,
        expiresAt: Date.now() + (json.expires_in || 0) * 1000,
      };
      return cachedToken.value;
    });
  });
};

const call = (method, path, payload) => {
  if (!isConfigured()) {
    return Promise.reject(
      apiError(503, 'Tracking is not set up yet: the Integration API credentials are missing.')
    );
  }
  return fetchToken().then(token => {
    const isGet = method === 'GET';
    const query = isGet && payload ? `?${new URLSearchParams(payload)}` : '';
    return fetch(`${BASE_URL}/v1/integration_api${path}${query}`, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
        ...(isGet ? {} : { 'Content-Type': 'application/json' }),
      },
      ...(isGet ? {} : { body: JSON.stringify(payload) }),
    }).then(res =>
      res
        .json()
        .catch(() => ({}))
        .then(json => {
          if (!res.ok) {
            throw apiError(res.status, `Integration API ${path} failed (${res.status}).`, json);
          }
          return json;
        })
    );
  });
};

module.exports = {
  isConfigured,
  showTransaction: id => call('GET', '/transactions/show', { id }),
  updateTransactionMetadata: (id, metadata) =>
    call('POST', '/transactions/update_metadata', { id, metadata }),
  transitionTransaction: (id, transition, params = {}) =>
    call('POST', '/transactions/transition', { id, transition, params }),
  // For tests: forget the cached token.
  _resetToken: () => {
    cachedToken = null;
  },
};
