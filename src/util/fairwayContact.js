/**
 * FAIRWAY: the contact details a freight label needs, checked the same way
 * for sellers (sender address, EditListingShippingPanel) and buyers (delivery
 * address, checkout ShippingDetails).
 *
 * We ship inside Denmark only, at one flat rate, so a postcode is four digits
 * and a phone number is a Danish one. Carriers text the recipient about the
 * parcel, which is why the number is required on both sides.
 */

export const DANISH_POSTCODE = /^\d{4}$/;
export const DANISH_PHONE = /^(\+?45)?\s*(\d\s*){8}$/;

// A final-form validator for a pattern; empty values are left to `required`
export const matches = (regex, message) => value =>
  !value || regex.test(String(value).trim()) ? undefined : message;

// "12345678", "12 34 56 78", "+4512345678" and "45 12 34 56 78" all become
// "+45 12 34 56 78", so the label service receives one format.
export const normalisePhone = value => {
  const digits = String(value || '').replace(/\D/g, '');
  const local = digits.length === 10 && digits.startsWith('45') ? digits.slice(2) : digits;
  return `+45 ${local.slice(0, 2)} ${local.slice(2, 4)} ${local.slice(4, 6)} ${local.slice(6, 8)}`;
};
