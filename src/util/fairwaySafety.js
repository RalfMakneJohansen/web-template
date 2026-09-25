/**
 * FAIRWAY: spotting a message that moves payment or contact off Fairway.
 *
 * The classic second-hand scam is "pay me on MobilePay instead" — the buyer
 * then has no protection and the money is gone. A message that looks like
 * that gets a gentle reminder under the text field; nothing is blocked, since
 * phone numbers are sometimes fine (arranging a pickup).
 */

const PAYMENT_WORDS = [
  /mobile\s?pay/i,
  /mobilpay/i,
  /bank\s?overf[øo]rsel/i,
  /overf[øo]r\s+(pengene|beløbet|til\s+min)/i,
  /\breg\.?\s?(nr|nummer)/i,
  /\bkonto\s?(nr|nummer)/i,
  /\biban\b/i,
  /\bswish\b/i,
  /\bvipps\b/i,
  /\bpaypal\b/i,
  /\brevolut\b/i,
];

// A Danish phone number: eight digits, optionally after +45 or 0045, with
// spaces or dashes between them. Prices and years are too short to match.
const PHONE = /(?:\+45|0045)?[\s-]?(?:\d[\s-]?){7}\d(?!\d)/;

/**
 * @param {string} text a message being typed
 * @returns {boolean} whether it mentions paying outside Fairway or a phone number
 */
export const mentionsOffPlatformPayment = text => {
  if (typeof text !== 'string' || text.length < 6) {
    return false;
  }
  return PAYMENT_WORDS.some(re => re.test(text)) || PHONE.test(text);
};
