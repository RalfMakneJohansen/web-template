import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as log from '../../util/log';
import { isForbiddenError, storableError } from '../../util/errors';
import { addMarketplaceEntities } from '../../ducks/marketplaceData.duck';
import { createImageVariantConfig } from '../../util/sdkLoader';

const NEWEST_LISTING_COUNT = 12;

export const fetchNewestListings = createAsyncThunk(
  'landingPage/fetchNewestListings',
  async (listingImageConfig, thunkAPI) => {
    const { extra: sdk, rejectWithValue, dispatch } = thunkAPI;
    const { aspectWidth = 1, aspectHeight = 1, variantPrefix = 'listing-card' } = listingImageConfig;
    const aspectRatio = aspectHeight / aspectWidth;

    return sdk.listings
      .query({
        perPage: NEWEST_LISTING_COUNT,
        page: 1,
        sort: '-createdAt',
        minStock: 1,
        stockMode: 'match-undefined',
        include: ['images', 'author'],
        'fields.listing': [
          'title',
          'geolocation',
          'price',
          'deleted',
          'state',
          'publicData.listingType',
          'publicData.transactionProcessAlias',
          'publicData.unitType',
          'publicData.cardStyle',
          'publicData.brand',
          'publicData.model',
          'publicData.condition',
          'publicData.shipment_type',
          'publicData.pickupEnabled',
          'publicData.shippingEnabled',
          // FAIRWAY: the card puts flex and loft in its title, and the API
          // returns no publicData that is not asked for — without these the
          // front page showed bare names while the search page showed specs.
          'publicData.categoryLevel1',
          'publicData.shaft_flex',
          'publicData.loft',
          'publicData.wedge_loft',
          'publicData.putter_length',
          'publicData.shoe_size',
        ],
        'fields.image': ['variants.listing-card', 'variants.listing-card-2x'],
        ...createImageVariantConfig(`${variantPrefix}`, 400, aspectRatio),
        ...createImageVariantConfig(`${variantPrefix}-2x`, 800, aspectRatio),
        'limit.images': 1,
      })
      .then(response => {
        dispatch(addMarketplaceEntities(response));
        return response.data.data.map(listing => listing.id);
      })
      .catch(error => {
        // Private marketplaces return 403 for anonymous users; that is access
        // control working as configured, not an app failure.
        log.error(error, 'landing-page-newest-listings-failed', {}, {
          skipSentry: isForbiddenError(error),
        });
        return rejectWithValue(storableError(error));
      });
  }
);

const landingPageSlice = createSlice({
  name: 'landingPage',
  initialState: {
    newestListingIds: [],
    fetchInProgress: false,
    fetchError: null,
  },
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchNewestListings.pending, state => {
        state.fetchInProgress = true;
        state.fetchError = null;
      })
      .addCase(fetchNewestListings.fulfilled, (state, action) => {
        state.fetchInProgress = false;
        state.newestListingIds = action.payload;
      })
      .addCase(fetchNewestListings.rejected, (state, action) => {
        state.fetchInProgress = false;
        state.fetchError = action.payload;
      });
  },
});

export default landingPageSlice.reducer;

export const loadData = (params, search, config) => dispatch => {
  return dispatch(fetchNewestListings(config.layout.listingImage));
};
