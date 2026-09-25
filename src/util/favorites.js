/**
 * FAIRWAY: saved listings ("Gem").
 *
 * Kept on the user's own profile, in privateData.favoriteListingIds, which
 * only that user can read. Newest first, capped so the profile stays small.
 */

export const MAX_FAVORITES = 100;

/**
 * The saved listing ids of the current user, as uuid strings.
 *
 * @param {Object} currentUser
 * @returns {Array<string>}
 */
export const favoriteIdsOf = currentUser => {
  const ids = currentUser?.attributes?.profile?.privateData?.favoriteListingIds;
  return Array.isArray(ids) ? ids.filter(id => typeof id === 'string') : [];
};

export const isFavorite = (currentUser, listingId) =>
  !!listingId && favoriteIdsOf(currentUser).includes(listingId);

/**
 * The list after saving or un-saving one listing: saving puts it first,
 * un-saving takes it out, and the oldest fall off past MAX_FAVORITES.
 *
 * @param {Array<string>} ids
 * @param {string} listingId
 * @returns {Array<string>}
 */
export const toggleFavoriteId = (ids, listingId) =>
  ids.includes(listingId)
    ? ids.filter(id => id !== listingId)
    : [listingId, ...ids].slice(0, MAX_FAVORITES);
