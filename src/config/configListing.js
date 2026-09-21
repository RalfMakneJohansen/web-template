/////////////////////////////////////////////////////////
// Configurations related to listing.                  //
// Main configuration here is the extended data config //
/////////////////////////////////////////////////////////

// Note: The listingFields come from listingFields asset nowadays by default.
//       To use this built-in configuration, you need to change the overwrite from configHelper.js
//       (E.g. use mergeDefaultTypesAndFieldsForDebugging func)

/**
 * Configuration options for listing fields (custom extended data fields):
 * - key:                           Unique key for the extended data field.
 * - scope (optional):              Scope of the extended data can be 'public', 'private', or 'metadata'.
 *                                  Default value: 'public'.
 *                                  Note: listing doesn't support 'protected' scope atm.
 * - schemaType (optional):         Schema for this extended data field.
 *                                  This is relevant when rendering components and querying listings.
 *                                  Possible values: 'enum', 'multi-enum', 'text', 'long', 'boolean'.
 * - enumOptions (optional):        Options shown for 'enum' and 'multi-enum' extended data.
 *                                  These are used to render options for inputs and filters on
 *                                  EditListingPage, ListingPage, and SearchPage.
 * - listingTypeConfig (optional):  Relationship configuration against listing types.
 *   - limitToListingTypeIds:         Indicator whether this listing field is relevant to a limited set of listing types.
 *   - listingTypeIds:                An array of listing types, for which this custom listing field is
 *                                    relevant and should be added. This is mandatory if limitToListingTypeIds is true.
 * - categoryConfig (optional):     Relationship configuration against categories.
 *   - limitToCategoryIds:            Indicator whether this listing field is relevant to a limited set of categories.
 *   - categoryIds:                   An array of categories, for which this custom listing field is
 *                                    relevant and should be added. This is mandatory if limitToCategoryIds is true.
 * - filterConfig:                  Filter configuration for listings query.
 *    - indexForSearch (optional):    If set as true, it is assumed that the extended data key has
 *                                    search index in place. I.e. the key can be used to filter
 *                                    listing queries (then scope needs to be 'public').
 *                                    Note: Sharetribe CLI can be used to set search index for the key:
 *                                    https://www.sharetribe.com/docs/references/extended-data/#search-schema
 *                                    Read more about filtering listings with public data keys from API Reference:
 *                                    https://www.sharetribe.com/api-reference/marketplace.html#extended-data-filtering
 *                                    Default value: false,
 *   - filterType:                    Sometimes a single schemaType can be rendered with different filter components.
 *                                    For 'enum' schema, filterType can be 'SelectSingleFilter' or 'SelectMultipleFilter'
 *   - label:                         Label for the filter, if the field can be used as query filter
 *   - searchMode (optional):         Search mode for indexed data with multi-enum schema.
 *                                    Possible values: 'has_all' or 'has_any'.
 *   - group:                         SearchPageWithMap has grouped filters. Possible values: 'primary' or 'secondary'.
 * - showConfig:                    Configuration for rendering listing. (How the field should be shown.)
 *   - label:                         Label for the saved data.
 *   - isDetail                       Can be used to hide detail row (of type enum, boolean, or long) from listing page.
 *                                    Default value: true,
 * - saveConfig:                    Configuration for adding and modifying extended data fields.
 *   - label:                         Label for the input field.
 *   - placeholderMessage (optional): Default message for user input.
 *   - isRequired (optional):         Is the field required for providers to fill
 *   - requiredMessage (optional):    Message for those fields, which are mandatory.
 */
/**
 * FAIRWAY's own listing fields.
 *
 * These are a local fallback: Console's listingFields asset is authoritative and
 * currently empty, so mergeListingConfig (util/configHelpers.js) falls back to
 * this list. Once the same fields exist in Console, this array can go back to
 * being empty and nothing else has to change.
 *
 * Keys are also the public data keys, so they are what the search page filters
 * on: pub_brand, pub_condition, pub_shipment_type.
 */
/**
 * Categories that are actual clubs, and the subset that has a shaft worth
 * describing. Putters have a shaft too, but nobody shops for putter flex.
 */
const CLUB_CATEGORIES = ['driver', 'fairway-wood', 'hybrid', 'jernsaet', 'wedge', 'putter'];
const SHAFTED_CATEGORIES = ['driver', 'fairway-wood', 'hybrid', 'jernsaet', 'wedge'];

/**
 * Every one of these is worth filtering on, but none of them can be queried
 * until the key has a search index in Sharetribe:
 *   flex-cli search set --key pub_<key> --type enum --scope public -m <id>
 * Until then the filter stays hidden — a filter that errors is worse than no
 * filter. Flip both booleans once the indexes exist.
 */
const FILTER_OFF = (label, group) => ({
  indexForSearch: false,
  showFilter: false,
  filterType: 'SelectMultipleFilter',
  label,
  group,
});

/**
 * The brands a Danish golfer is actually selling.
 *
 * Offered as suggestions on the Mærke field, not enforced: you can still type
 * a make that is not here, which matters for an old club or a small maker.
 * The point is that nobody has to spell TaylorMade, and that two listings of
 * the same brand end up written the same way — free text is how a catalogue
 * ends up with "ping", "PING" and "Ping" as three different brands.
 *
 * Ordered by how often they turn up in a Danish bag, not alphabetically, so
 * the common ones are the first thing the list shows.
 */
const GOLF_BRANDS = [
  'TaylorMade',
  'Callaway',
  'Titleist',
  'PING',
  'Mizuno',
  'Cobra',
  'Srixon',
  'Cleveland',
  'Wilson',
  'Honma',
  'PXG',
  'Bridgestone',
  'XXIO',
  'Tour Edge',
  'Benross',
  'Yonex',
  // Putters
  'Scotty Cameron',
  'Odyssey',
  'Bettinardi',
  'L.A.B. Golf',
  'Evnroll',
  // Bags and trolleys
  'Sun Mountain',
  'Big Max',
  'Vessel',
  'Ogio',
  'Motocaddy',
  'PowaKaddy',
  // Shoes and clothing
  'FootJoy',
  'ECCO',
  'adidas',
  'Nike',
  'Puma',
  'Under Armour',
  'Skechers',
  'Galvin Green',
  // Electronics
  'Garmin',
  'Bushnell',
  'Shot Scope',
];

export const listingFields = [
  {
    key: 'brand',
    scope: 'public',
    suggestions: GOLF_BRANDS,
    // shortText, not text: 'text' renders an 84px textarea, and a brand name
    // is one line. The tall box also swallowed Enter on a phone instead of
    // moving the seller on. Same for model, shaft_model and iron_set below.
    // Only the widget changes — both types validate as a string and both are
    // `text` in the search schema.
    schemaType: 'shortText',
    showConfig: { label: 'Mærke', isDetail: true },
    saveConfig: {
      label: 'Mærke',
      placeholderMessage: 'Titleist, TaylorMade, PING…',
      isRequired: true,
      requiredMessage: 'Skriv hvilket mærke køllen er.',
    },
  },
  {
    key: 'model',
    scope: 'public',
    schemaType: 'shortText',
    showConfig: { label: 'Model', isDetail: true },
    saveConfig: {
      label: 'Model (valgfri)',
      placeholderMessage: 'GT3, Qi10, Vokey SM10…',
      isRequired: false,
    },
  },
  {
    key: 'condition',
    scope: 'public',
    schemaType: 'enum',
    enumOptions: [
      { option: 'som-ny', label: 'Som ny' },
      { option: 'god', label: 'God' },
      { option: 'okay', label: 'Okay' },
      { option: 'slidt', label: 'Slidt' },
    ],
    // Off until the search index exists in Sharetribe. Querying an unindexed
    // key makes the API reject the search, so the filter stays hidden until:
    //   flex-cli search set --key pub_condition --type enum -m <marketplace>
    // Then set indexForSearch and showFilter to true here.
    filterConfig: {
      indexForSearch: false,
      showFilter: false,
      filterType: 'SelectMultipleFilter',
      label: 'Stand',
      group: 'primary',
    },
    showConfig: { label: 'Stand', isDetail: true },
    saveConfig: {
      label: 'Stand',
      isRequired: true,
      requiredMessage: 'Vælg hvilken stand udstyret er i.',
    },
  },
  {
    // The automation that books a box and a label reads this. There is no
    // default: a listing must not publish without the seller choosing.
    key: 'shipment_type',
    scope: 'public',
    schemaType: 'enum',
    enumOptions: [
      { option: 'box', label: 'Send mig en gratis kasse' },
      { option: 'own', label: 'Jeg pakker og sender selv' },
      // 'pickup' is deliberately left out for now: collection bypasses our
      // freight and escrow. Re-adding it here also needs pickup enabled on the
      // listing type in Console, or the buyer hits a dead end at checkout.
    ],
    // Same as condition: needs pub_shipment_type indexed before it can filter.
    filterConfig: {
      indexForSearch: false,
      showFilter: false,
      filterType: 'SelectMultipleFilter',
      label: 'Levering',
      group: 'secondary',
    },
    showConfig: { label: 'Levering', isDetail: true },
    saveConfig: {
      label: 'Hvordan vil du sende varen?',
      isRequired: true,
      requiredMessage: 'Vælg hvordan varen skal sendes.',
    },
  },
  // ---- Club specifics, scoped to the categories where they make sense ----
  // These are what a buyer filters on later, so they are enums wherever the
  // real world allows a fixed list. All optional: the hard requirements before
  // publishing stay category, brand, condition, price, photos and shipping.
  {
    key: 'dexterity',
    scope: 'public',
    schemaType: 'enum',
    categoryConfig: { limitToCategoryIds: true, categoryIds: CLUB_CATEGORIES },
    enumOptions: [
      { option: 'right', label: 'Højrehåndet' },
      { option: 'left', label: 'Venstrehåndet' },
    ],
    filterConfig: FILTER_OFF('Hånd', 'primary'),
    showConfig: { label: 'Hånd', isDetail: true },
    saveConfig: {
      label: 'Højre- eller venstrehåndet',
      isRequired: true,
      requiredMessage: 'Vælg om køllen er højre- eller venstrehåndet.',
    },
  },
  {
    key: 'shaft_flex',
    scope: 'public',
    schemaType: 'enum',
    categoryConfig: { limitToCategoryIds: true, categoryIds: SHAFTED_CATEGORIES },
    enumOptions: [
      { option: 'ladies', label: 'Ladies' },
      { option: 'senior', label: 'Senior' },
      { option: 'regular', label: 'Regular' },
      { option: 'stiff', label: 'Stiff' },
      { option: 'extra-stiff', label: 'Extra-Stiff' },
    ],
    filterConfig: FILTER_OFF('Flex', 'primary'),
    showConfig: { label: 'Flex', isDetail: true },
    saveConfig: {
      label: 'Flex',
      isRequired: true,
      requiredMessage: 'Vælg skaftets flex.',
    },
  },
  {
    key: 'shaft_material',
    scope: 'public',
    schemaType: 'enum',
    categoryConfig: { limitToCategoryIds: true, categoryIds: SHAFTED_CATEGORIES },
    enumOptions: [
      { option: 'steel', label: 'Stål' },
      { option: 'graphite', label: 'Grafit' },
    ],
    filterConfig: FILTER_OFF('Skaft', 'secondary'),
    showConfig: { label: 'Skaftmateriale', isDetail: true },
    saveConfig: { label: 'Skaft' },
  },
  {
    key: 'shaft_model',
    scope: 'public',
    schemaType: 'shortText',
    categoryConfig: { limitToCategoryIds: true, categoryIds: SHAFTED_CATEGORIES },
    showConfig: { label: 'Skaftmodel', isDetail: true },
    saveConfig: {
      label: 'Skaftmodel (valgfri)',
      placeholderMessage: 'Ventus Blue 6S, Project X 6.0…',
    },
  },
  {
    // Driver, fairway wood and hybrid share one loft list; wedges have their own
    key: 'loft',
    scope: 'public',
    schemaType: 'enum',
    categoryConfig: {
      limitToCategoryIds: true,
      categoryIds: ['driver', 'fairway-wood', 'hybrid'],
    },
    enumOptions: [
      { option: '8-0', label: '8.0°' },
      { option: '8-5', label: '8.5°' },
      { option: '9-0', label: '9.0°' },
      { option: '9-5', label: '9.5°' },
      { option: '10-0', label: '10.0°' },
      { option: '10-5', label: '10.5°' },
      { option: '11-0', label: '11.0°' },
      { option: '12-0', label: '12.0°' },
      { option: '13-0', label: '13.0°' },
      { option: '15-0', label: '15.0°' },
      { option: '16-5', label: '16.5°' },
      { option: '18-0', label: '18.0°' },
      { option: '19-0', label: '19.0°' },
      { option: '21-0', label: '21.0°' },
      { option: '22-0', label: '22.0°' },
      { option: '24-0', label: '24.0°' },
      { option: '27-0', label: '27.0°' },
    ],
    filterConfig: FILTER_OFF('Loft', 'primary'),
    showConfig: { label: 'Loft', isDetail: true },
    saveConfig: {
      label: 'Loft',
      isRequired: true,
      requiredMessage: 'Vælg loft.',
    },
  },
  {
    key: 'wedge_loft',
    scope: 'public',
    schemaType: 'enum',
    categoryConfig: { limitToCategoryIds: true, categoryIds: ['wedge'] },
    enumOptions: [
      { option: '46', label: '46°' },
      { option: '48', label: '48°' },
      { option: '50', label: '50°' },
      { option: '52', label: '52°' },
      { option: '54', label: '54°' },
      { option: '56', label: '56°' },
      { option: '58', label: '58°' },
      { option: '60', label: '60°' },
      { option: '62', label: '62°' },
      { option: '64', label: '64°' },
    ],
    filterConfig: FILTER_OFF('Loft', 'primary'),
    showConfig: { label: 'Loft', isDetail: true },
    saveConfig: {
      label: 'Loft',
      isRequired: true,
      requiredMessage: 'Vælg loft.',
    },
  },
  {
    key: 'iron_set',
    scope: 'public',
    schemaType: 'shortText',
    categoryConfig: { limitToCategoryIds: true, categoryIds: ['jernsaet'] },
    showConfig: { label: 'Sættet indeholder', isDetail: true },
    saveConfig: {
      label: 'Hvilke jern er med?',
      placeholderMessage: '5–PW, eller 4-5-6-7-8-9-PW',
    },
  },
  {
    key: 'putter_type',
    scope: 'public',
    schemaType: 'enum',
    categoryConfig: { limitToCategoryIds: true, categoryIds: ['putter'] },
    enumOptions: [
      { option: 'blade', label: 'Blade' },
      { option: 'mallet', label: 'Mallet' },
    ],
    filterConfig: FILTER_OFF('Puttertype', 'primary'),
    showConfig: { label: 'Type', isDetail: true },
    saveConfig: { label: 'Puttertype' },
  },
  {
    key: 'putter_length',
    scope: 'public',
    schemaType: 'enum',
    categoryConfig: { limitToCategoryIds: true, categoryIds: ['putter'] },
    enumOptions: [
      { option: '32', label: '32"' },
      { option: '33', label: '33"' },
      { option: '34', label: '34"' },
      { option: '35', label: '35"' },
      { option: '36', label: '36"' },
    ],
    filterConfig: FILTER_OFF('Længde', 'secondary'),
    showConfig: { label: 'Længde', isDetail: true },
    saveConfig: { label: 'Længde' },
  },
  {
    key: 'shoe_size',
    scope: 'public',
    schemaType: 'enum',
    categoryConfig: { limitToCategoryIds: true, categoryIds: ['sko'] },
    enumOptions: [
      { option: '38', label: '38' },
      { option: '39', label: '39' },
      { option: '40', label: '40' },
      { option: '41', label: '41' },
      { option: '42', label: '42' },
      { option: '43', label: '43' },
      { option: '44', label: '44' },
      { option: '45', label: '45' },
      { option: '46', label: '46' },
      { option: '47', label: '47' },
      { option: '48', label: '48' },
    ],
    filterConfig: FILTER_OFF('Størrelse (EU)', 'primary'),
    showConfig: { label: 'Størrelse (EU)', isDetail: true },
    saveConfig: { label: 'Størrelse (EU)' },
  },
  {
    // The three fields below are written by the shipping automation, never by
    // the seller. Metadata scope means the wizard never renders them (only
    // public and private fields get inputs) and the Marketplace API refuses
    // client-side writes — they can only be set through the Integration API.
    key: 'tracking_a',
    scope: 'metadata',
    schemaType: 'text',
    showConfig: { label: 'Sporingsnummer (kasse ud)', isDetail: false },
  },
  {
    key: 'tracking_b',
    scope: 'metadata',
    schemaType: 'text',
    showConfig: { label: 'Sporingsnummer (til køber)', isDetail: false },
  },
  {
    key: 'box_dispatched_at',
    scope: 'metadata',
    schemaType: 'text',
    showConfig: { label: 'Kasse afsendt', isDetail: false },
  },
];

/**
 * Categories, as a local fallback for Console's listing-categories asset.
 *
 * The ids are the ones the topbar nav and the landing page already link to
 * (?pub_categoryLevel1=<id>), so they must not be renamed without changing
 * those links too.
 */
export const categories = [
  { name: 'Driver', id: 'driver', subcategories: [] },
  { name: 'Fairway wood', id: 'fairway-wood', subcategories: [] },
  { name: 'Hybrid', id: 'hybrid', subcategories: [] },
  { name: 'Jernsæt', id: 'jernsaet', subcategories: [] },
  { name: 'Wedge', id: 'wedge', subcategories: [] },
  { name: 'Putter', id: 'putter', subcategories: [] },
  { name: 'Bag', id: 'bag', subcategories: [] },
  { name: 'Sko', id: 'sko', subcategories: [] },
  { name: 'Andet', id: 'andet', subcategories: [] },
];

/**
 * Minimum number of photos before a listing may be published.
 */
export const minListingImages = 3;

///////////////////////////////////////////////////////////////////////
// Configurations related to listing types and transaction processes //
///////////////////////////////////////////////////////////////////////

// A presets of supported listing configurations
//
// Note 1: The listingTypes come from listingTypes asset nowadays by default.
//         To use this built-in configuration, you need to change the overwrite from configHelper.js
//         (E.g. use mergeDefaultTypesAndFieldsForDebugging func)
// Note 2: transaction type is part of listing type. It defines what transaction process and units
//         are used when transaction is created against a specific listing.

/**
 * Configuration options for listing experience:
 * - listingType:         Unique string. This will be saved to listing's public data on
 *                        EditListingWizard.
 * - label                Label for the listing type. Used as microcopy for options to select
 *                        listing type in EditListingWizard.
 * - transactionType      Set of configurations how this listing type will behave when transaction is
 *                        created.
 *   - process              Transaction process.
 *                          The process must match one of the processes that this client app can handle
 *                          (check src/util/transactions/transaction.js) and the process must also exists in correct
 *                          marketplace environment.
 *   - alias                Valid alias for the aforementioned process. This will be saved to listing's
 *                          public data as transctionProcessAlias and transaction is initiated with this.
 *   - unitType             Unit type is mainly used as pricing unit. This will be saved to
 *                          transaction's protected data.
 *                          Recommendation: don't use same unit types in completely different processes
 *                          ('item' sold should not be priced the same as 'item' booked).
 * - stockType            This is relevant only to listings using default-purchase process.
 *                        If set to 'oneItem', stock management is not showed and the listing is
 *                        considered unique (stock = 1).
 *                        Possible values: 'oneItem', 'multipleItems', 'infiniteOneItem', and 'infiniteMultipleItems'.
 *                        Default: 'multipleItems'.
 * - availabilityType     This is relevant only to listings using default-booking process.
 *                        If set to 'oneSeat', seat management is not showed and the listing is
 *                        considered per person (seat = 1).
 *                        Possible values: 'oneSeat' and 'multipleSeats'.
 *                        Default: 'oneSeat'.
 * - priceVariations      This is relevant only to listings using default-booking process.
 *   - enabled:             If set to true, price variations are enabled.
 *                          Default: false.
 * - defaultListingFields These are tied to transaction processes. Different processes have different flags.
 *                        E.g. default-inquiry can toggle price and location to true/false value to indicate,
 *                        whether price (or location) tab should be shown. If defaultListingFields.price is not
 *                        explicitly set to _false_, price will be shown.
 *                        If the location or pickup is not used, listing won't be returned with location search.
 *                        Use keyword search as main search type if location is not enforced.
 *                        The payoutDetails flag allows provider to bypass setting of payout details.
 *                        Note: customers can't order listings, if provider has not set payout details! Monitor
 *                        providers who have not set payout details and contact them to ensure that they add the details.
 * - transactionFields    You can define an array of custom transaction fields for each listing type. Each transaction field
 *                        should have the following attributes:
 *                        - key (string)
 *                        - label (string)
 *                        - showTo (string, options: 'customer', 'provider'). Option 'provider' is only used for negotiation process.
 *                        - schemaType (string, options: 'enum', 'multi-enum', 'text', 'long', 'boolean', 'youtubeVideoUrl')
 *                        - saveConfig (object, optional,  { required: true })
 *                        - schema specific attributes:
 *                          - numberConfig (object, for schemaType: 'long'): { minimum: number, maximum: number }
 *                          - enumOptions (array, for schemaType: 'enum', 'multi-enum'): [{ label: string, option: string }]
 * - messagingOptions     Options for the messaging experience
 *  - fileAttachments:    - if set to true, uploading file attachments to messages is enabled. Marketplace level access control
 *                          configuration may still disable uploading and downloading files, even if enabled in the listing type.
 */

export const listingTypes = [
  // // Here are some examples of listingTypes
  // // TODO: SearchPage does not work well if both booking and product selling are used at the same time
  // {
  //   listingType: 'daily-booking',
  //   label: 'Daily booking',
  //   transactionType: {
  //     process: 'default-booking',
  //     alias: 'default-booking/release-1',
  //     unitType: 'day',
  //   },
  //   availabilityType: 'oneSeat',
  //   defaultListingFields: {
  //     location: true,
  //     payoutDetails: true,
  //   },
  //   transactionFields: [
  //     {
  //       showTo: 'customer',
  //       label: 'Extra requests for the hosts',
  //       key: 'requests',
  //       schemaType: 'text',
  //     },
  //     {
  //       showTo: 'customer',
  //       label: 'Are you traveling with minors?',
  //       key: 'minors',
  //       schemaType: 'boolean',
  //     },
  //     {
  //       showTo: 'customer',
  //       numberConfig: {
  //         minimum: 1,
  //         maximum: 10,
  //       },
  //       label: 'How many people are staying at the venue',
  //       key: 'peopleStaying',
  //       schemaType: 'long',
  //       saveConfig: {
  //         required: true,
  //       },
  //     },
  //     {
  //       showTo: 'customer',
  //       enumOptions: [
  //         {
  //           label: 'Morning cleanup (10am-12am)',
  //           option: 'morning',
  //         },
  //         {
  //           label: 'Afternoon cleanup (2pm-4pm)',
  //           option: 'afternoon',
  //         },
  //       ],
  //       label: 'Schedule preference',
  //       key: 'schedulePreference',
  //       schemaType: 'enum',
  //     },
  //     {
  //       showTo: 'customer',
  //       enumOptions: [
  //         {
  //           label: 'Vegetarian',
  //           option: 'vegetarian',
  //         },
  //         {
  //           label: 'Vegan',
  //           option: 'vegan',
  //         },
  //         {
  //           label: 'Gluten free',
  //           option: 'glutenFree',
  //         },
  //         {
  //           label: 'No caffeine',
  //           option: 'decaf',
  //         },
  //         {
  //           label: 'Nut free',
  //           option: 'nutFree',
  //         },
  //         {
  //           label: 'Dairy free',
  //           option: 'dairyFree',
  //         },
  //       ],
  //       label: 'Dietary preferences',
  //       key: 'dietaryPreferences',
  //       schemaType: 'multi-enum',
  //     },
  //   ],
  //   messagingOptions	{ fileAttachments: false }
  // },
  // {
  //   listingType: 'nightly-booking',
  //   label: 'Nightly booking',
  //   transactionType: {
  //     process: 'default-booking',
  //     alias: 'default-booking/release-1',
  //     unitType: 'night',
  //   },
  // },
  // {
  //   listingType: 'hourly-booking',
  //   label: 'Hourly booking',
  //   transactionType: {
  //     process: 'default-booking',
  //     alias: 'default-booking/release-1',
  //     unitType: 'hour',
  //   },
  // },
  // {
  //   listingType: 'product-selling',
  //   label: 'Sell bicycles',
  //   transactionType: {
  //     process: 'default-purchase',
  //     alias: 'default-purchase/release-1',
  //     unitType: 'item',
  //   },
  //   stockType: 'multipleItems',
  //   defaultListingFields: {
  //     shipping: true,
  //     pickup: true,
  //     payoutDetails: true,
  //   },
  // },
  // {
  //   listingType: 'inquiry',
  //   label: 'Inquiry',
  //   transactionType: {
  //     process: 'default-inquiry',
  //     alias: 'default-inquiry/release-1',
  //     unitType: 'inquiry',
  //   },
  //   defaultListingFields: {
  //     price: false,
  //     location: true,
  //   },
  // },
  //   {
  //   label: 'Digital file upload',
  //   listingType: 'digital-file',
  //   transactionType: {
  //     process: 'default-download',
  //     alias: 'default-download/release-1',
  //     unitType: 'file',
  //   },
  //   transactionFields: [
  //     {
  //       label: 'Arbitrary field',
  //       key: 'arbitrary',
  //       schemaType: 'shortText',
  //       showTo: 'customer',
  //       helpText: 'A text field with a 70 char limit',
  //     },
  //   ],
  //   defaultListingFields: {
  //     description: true,
  //     availability: false,
  //     payoutDetails: true,
  //     images: false,
  //     pickup: false,
  //     title: true,
  //     shipping: false,
  //     location: false,
  //     price: true,
  //     stock: false,
  //   },
  // },
];

// SearchPage can enforce listing query to only those listings with valid listingType
// However, it only works if you have set 'enum' type search schema for the public data fields
//   - listingType
//
//  Similar setup could be expanded to 2 other extended data fields:
//   - transactionProcessAlias
//   - unitType
//
// Read More:
// https://www.sharetribe.com/docs/how-to/manage-search-schemas-with-flex-cli/#adding-listing-search-schemas
export const enforceValidListingType = false;
