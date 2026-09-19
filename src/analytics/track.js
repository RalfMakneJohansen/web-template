/**
 * Fairway's event layer.
 *
 * The template only ever sent `page_view`, which tells us nothing about where
 * people fall out of the funnel. This adds the events a marketplace actually
 * runs on, behind one call so a component never has to know whether GA4 exists.
 *
 * Two sinks:
 * - GA4, when a measurement id is configured in Console (Analytics). Until
 *   then `window.gtag` is simply absent and nothing is sent.
 * - The console, in development, so the funnel can be verified by clicking
 *   through it before GA is set up at all.
 *
 * Every call is wrapped: analytics must never be able to break a page.
 */

/** The funnel, named once so a typo can't silently create a second event. */
export const EVENTS = {
  // Account
  SIGNUP_STARTED: 'fw_signup_started',
  SIGNUP_COMPLETED: 'fw_signup_completed',
  LOGIN_COMPLETED: 'fw_login_completed',

  // Selling
  LISTING_DRAFT_CREATED: 'fw_listing_draft_created',
  LISTING_STEP_COMPLETED: 'fw_listing_step_completed',
  LISTING_PHOTOS_ADDED: 'fw_listing_photos_added',
  LISTING_SHIPPING_CHOSEN: 'fw_listing_shipping_chosen',
  LISTING_PUBLISHED: 'fw_listing_published',
  PRICE_GUIDANCE_SHOWN: 'fw_price_guidance_shown',

  // Buying
  LISTING_VIEWED: 'fw_listing_viewed',
  CONTACT_SELLER_CLICKED: 'fw_contact_seller_clicked',
  OFFER_STARTED: 'fw_offer_started',
  LISTING_SHARED: 'fw_listing_shared',
  BUY_CLICKED: 'fw_buy_clicked',

  // Finding
  SEARCH_PERFORMED: 'fw_search_performed',
  FILTER_APPLIED: 'fw_filter_applied',
  CATEGORY_OPENED: 'fw_category_opened',
};

const isDev = process.env.NODE_ENV === 'development';

/**
 * GA4 rejects nested objects and undefined values, so params are flattened to
 * primitives and empties dropped before sending.
 */
const clean = params => {
  if (!params) {
    return {};
  }
  return Object.entries(params).reduce((acc, [key, value]) => {
    if (value === null || value === undefined || value === '') {
      return acc;
    }
    const isPrimitive = ['string', 'number', 'boolean'].includes(typeof value);
    acc[key] = isPrimitive ? value : Array.isArray(value) ? value.join(',') : String(value);
    return acc;
  }, {});
};

/**
 * Send one event.
 *
 * @param {string} event one of EVENTS
 * @param {Object} [params] flat key/value pairs describing the event
 */
export const track = (event, params) => {
  try {
    const payload = clean(params);

    if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
      window.gtag('event', event, payload);
    }

    if (isDev) {
      // eslint-disable-next-line no-console
      console.info(`%c◆ ${event}`, 'color:#0f6e56;font-weight:600', payload);
    }
  } catch (e) {
    // Analytics is never allowed to take a page down with it.
  }
};

/**
 * Price in whole currency units — GA4 has no use for subunits, and reporting on
 * "329900" instead of "3299" makes every revenue number wrong.
 */
export const priceParam = money =>
  money && typeof money.amount === 'number' ? money.amount / 100 : undefined;
