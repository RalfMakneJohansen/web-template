import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

import { createImageVariantConfig } from '../../util/sdkLoader';
import { storableError } from '../../util/errors';
import { addMarketplaceEntities } from '../../ducks/marketplaceData.duck';
import { fetchCurrentUser } from '../../ducks/user.duck';
import { favoriteIdsOf } from '../../util/favorites';

// ================ Constants ================ //

// Enough for the numbers and lists on the page without paging. A seller with
// more than this sees the full lists under Indbakke and Dine annoncer.
const TX_PAGE_SIZE = 50;
const LISTING_PAGE_SIZE = 6;
const FAVORITES_SHOWN = 6;

const imageParams = {
  'fields.image': ['variants.listing-card', 'variants.listing-card-2x'],
  ...createImageVariantConfig('listing-card', 400, 1),
  ...createImageVariantConfig('listing-card-2x', 800, 1),
};

const entityRefs = response =>
  (response?.data?.data || []).map(entity => ({ id: entity.id, type: entity.type }));

// ================ Async thunks ================ //

/**
 * FAIRWAY: everything "Min side" shows — your listings, your sales and your
 * purchases — fetched in parallel. Entities go to marketplaceData; this page
 * keeps only the references and the listing total.
 */
const loadOverviewPayloadCreator = (_, { dispatch, rejectWithValue, extra: sdk }) => {
  const txQuery = only =>
    sdk.transactions.query({
      only,
      include: ['listing', 'listing.images', only === 'sale' ? 'customer' : 'provider'],
      perPage: TX_PAGE_SIZE,
      ...imageParams,
    });

  return Promise.all([
    sdk.ownListings.query({
      perPage: LISTING_PAGE_SIZE,
      include: ['images'],
      'limit.images': 1,
      ...imageParams,
    }),
    txQuery('sale'),
    txQuery('order'),
  ])
    .then(([listingsRes, salesRes, ordersRes]) => {
      dispatch(addMarketplaceEntities(listingsRes));
      dispatch(addMarketplaceEntities(salesRes));
      dispatch(addMarketplaceEntities(ordersRes));
      return {
        listingRefs: entityRefs(listingsRes),
        listingCount: listingsRes.data.meta?.totalItems || 0,
        saleRefs: entityRefs(salesRes),
        orderRefs: entityRefs(ordersRes),
      };
    })
    .catch(e => rejectWithValue(storableError(e)));
};

/**
 * FAIRWAY: the listings the user has saved ("Gem"), newest first. Sold or
 * deleted listings simply don't come back from the API.
 */
export const loadFavoritesThunk = createAsyncThunk(
  'OverviewPage/loadFavorites',
  (_, { getState, dispatch, rejectWithValue, extra: sdk }) => {
    const ids = favoriteIdsOf(getState().user?.currentUser).slice(0, FAVORITES_SHOWN);
    if (ids.length === 0) {
      return Promise.resolve([]);
    }
    return sdk.listings
      .query({ ids: ids.join(','), include: ['images'], 'limit.images': 1, ...imageParams })
      .then(response => {
        dispatch(addMarketplaceEntities(response));
        const byId = new Map(entityRefs(response).map(r => [r.id.uuid, r]));
        // Keep the user's order (newest saved first), not the API's.
        return ids.map(id => byId.get(id)).filter(Boolean);
      })
      .catch(e => rejectWithValue(storableError(e)));
  }
);

export const loadOverviewThunk = createAsyncThunk(
  'OverviewPage/loadOverview',
  loadOverviewPayloadCreator
);

// ================ Slice ================ //

const initialState = {
  listingRefs: [],
  listingCount: 0,
  saleRefs: [],
  orderRefs: [],
  favoriteRefs: [],
  loadInProgress: false,
  loadError: null,
};

const overviewPageSlice = createSlice({
  name: 'OverviewPage',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(loadOverviewThunk.pending, state => {
        state.loadInProgress = true;
        state.loadError = null;
      })
      .addCase(loadOverviewThunk.fulfilled, (state, action) => {
        return { ...state, ...action.payload, loadInProgress: false };
      })
      .addCase(loadFavoritesThunk.fulfilled, (state, action) => {
        state.favoriteRefs = action.payload;
      })
      .addCase(loadOverviewThunk.rejected, (state, action) => {
        state.loadInProgress = false;
        state.loadError = action.payload;
      });
  },
});

export default overviewPageSlice.reducer;

// ================ Load data ================ //

export const loadData = () => dispatch =>
  Promise.all([
    // Saved listings live on the user, so they wait for the user to load.
    dispatch(fetchCurrentUser()).then(() => dispatch(loadFavoritesThunk())),
    dispatch(loadOverviewThunk()),
  ]);
