///////////////////////////////////////////////////////
// This file contains configs that affect layout     //
// NOTE: these are just some of the relevant configs //
// Most of the work happens in components.           //
///////////////////////////////////////////////////////

// Note: These come from the layout asset nowadays by default.
//       To use this built-in configuration, you need to remove the overwrite from configHelper.js (mergeLayouts func)

// There are 2 SearchPage variants that can be used:
// 'map' & 'grid'
export const searchPage = {
  variantType: 'map',
};

// ListingPage has 2 layout options: 'coverPhoto' and 'carousel'.
// - 'coverPhoto' means a layout where there's a hero section with cropped image in the beginning of the page
// - 'carousel' shows image carousel, where listing images are shown with the original aspect ratio
export const listingPage = {
  variantType: 'carousel',
};

// ListingImage currently supports only one variant type, but it has aspectRatio as an extra configuration.
export const listingImage = {
  variantType: 'cropImage',
  // Aspect ratio for listing image variants (width/height)
  // Note: This will be converted to separate aspectWidth and aspectHeight values
  // to make calculations easier.
  //
  // FAIRWAY: square, because the card is square. This value decides the size
  // of the image the API generates, and it was 4/3 while FairwayListingCard
  // renders a 1/1 box — so every tile took a 400x300 crop, squeezed it into a
  // square and then cropped it again with object-fit. Two crops, the second
  // one uncontrolled, on every photo on the site.
  aspectRatio: '1/1',
  // Listings have custom image variants, which are named here.
  variantPrefix: 'listing-card',
};
