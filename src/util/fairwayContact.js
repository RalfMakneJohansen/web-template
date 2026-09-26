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

/**
 * The seller's sender address as form values, from the profile.
 *
 * Stored once on the seller's own profile (protectedData.senderAddress plus
 * the template's protectedData.phoneNumber) and shared by all their listings.
 * The name falls back to the account name, which is almost always right.
 *
 * @param {Object} currentUser API entity
 * @returns {Object} values for SenderAddressFields
 */
export const senderInitialValues = currentUser => {
  const profile = currentUser?.attributes?.profile || {};
  const protectedData = profile.protectedData || {};
  const sender = protectedData.senderAddress || {};
  const fallbackName = [profile.firstName, profile.lastName].filter(Boolean).join(' ');
  return {
    senderName: sender.name || fallbackName || undefined,
    senderLine1: sender.line1,
    senderPostal: sender.postalCode,
    senderCity: sender.city,
    senderPhone: protectedData.phoneNumber,
  };
};

/**
 * The profile update that stores SenderAddressFields' values.
 *
 * @param {Object} values form values from SenderAddressFields
 * @returns {Object} params for sdk.currentUser.updateProfile
 */
export const senderProfileUpdate = values => ({
  protectedData: {
    senderAddress: {
      name: values.senderName.trim(),
      line1: values.senderLine1.trim(),
      postalCode: values.senderPostal.trim(),
      city: values.senderCity.trim(),
      country: 'DK',
    },
    phoneNumber: normalisePhone(values.senderPhone),
  },
});

/**
 * What a user has in place to trade, and what is still missing.
 *
 * - emailVerified: Sharetribe sends no order emails to an unverified address.
 * - senderAddress: a seller's parcel needs a sender on the freight label.
 * - payoutAccount: a seller needs a Stripe account to be paid; Stripe also
 *   runs the identity check the law requires of anyone receiving payouts.
 *
 * A buyer needs nothing in advance: card, delivery address and mobile number
 * are all asked for at checkout.
 *
 * @param {Object} currentUser API entity, with the stripeAccount relationship
 * @returns {{ emailVerified: boolean, senderAddress: boolean, payoutAccount: boolean, readyToSell: boolean }}
 */
export const getTradeReadiness = currentUser => {
  const attributes = currentUser?.attributes || {};
  const protectedData = attributes.profile?.protectedData || {};
  const sender = protectedData.senderAddress || {};

  const emailVerified = !!attributes.emailVerified;
  const senderAddress =
    !!(sender.name && sender.line1 && sender.postalCode && sender.city) &&
    !!protectedData.phoneNumber;
  const payoutAccount = !!currentUser?.stripeAccount?.id;

  return {
    emailVerified,
    senderAddress,
    payoutAccount,
    readyToSell: emailVerified && senderAddress && payoutAccount,
  };
};

/**
 * FAIRWAY: when the current email was confirmed, as an ISO string, or null.
 * Written to privateData.emailVerifiedAt when the verification link is used
 * (ducks/emailVerification.duck.js); Sharetribe itself keeps only the flag.
 *
 * @param {Object} currentUser
 * @returns {string|null}
 */
export const emailVerifiedAtOf = currentUser => {
  const at = currentUser?.attributes?.profile?.privateData?.emailVerifiedAt;
  return typeof at === 'string' && !isNaN(Date.parse(at)) ? at : null;
};
