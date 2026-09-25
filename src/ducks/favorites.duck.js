import { createAsyncThunk } from '@reduxjs/toolkit';

import { denormalisedResponseEntities } from '../util/data';
import { storableError } from '../util/errors';
import { favoriteIdsOf, toggleFavoriteId } from '../util/favorites';

import { setCurrentUser } from './user.duck';

/**
 * FAIRWAY: save or un-save a listing for the current user.
 *
 * The list lives in the user's own privateData (util/favorites.js). Sharetribe
 * merges privateData by top-level key, so only favoriteListingIds changes.
 * The updated user goes straight into state.user.currentUser, so every heart
 * on the page flips at once.
 */
export const toggleFavoriteThunk = createAsyncThunk(
  'favorites/toggle',
  ({ listingId }, { getState, dispatch, rejectWithValue, extra: sdk }) => {
    const currentUser = getState().user?.currentUser;
    const favoriteListingIds = toggleFavoriteId(favoriteIdsOf(currentUser), listingId);

    return sdk.currentUser
      .updateProfile(
        { privateData: { favoriteListingIds } },
        { expand: true, include: ['profileImage', 'stripeAccount'] }
      )
      .then(response => {
        const [user] = denormalisedResponseEntities(response);
        if (user) {
          dispatch(setCurrentUser(user));
        }
        return favoriteListingIds;
      })
      .catch(e => rejectWithValue(storableError(e)));
  }
);

export const toggleFavorite = listingId => dispatch =>
  dispatch(toggleFavoriteThunk({ listingId })).unwrap();
