/**
 * FAIRWAY: what we know about golf gear, so a seller can tap instead of type.
 *
 * Brands, the models each brand actually makes, the lofts that exist for each
 * kind of club, and how the listing title is put together from the answers.
 * Everything here is a suggestion: the listing fields stay free text or plain
 * enums, so an old club or a small maker never gets stuck.
 */

/**
 * The brands a Danish golfer is actually selling.
 *
 * Ordered by how often they turn up in a Danish bag, not alphabetically, so
 * the common ones come first. This is also the Mærke field's suggestion list
 * (config/configListing.js), so two listings of the same brand end up spelled
 * the same way — free text is how a catalogue ends up with "ping", "PING" and
 * "Ping" as three brands.
 */
export const GOLF_BRANDS = [
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

/**
 * Which kind of gear a category is, for the questions that differ between
 * a driver and a pair of shoes: the brands worth showing first and the models
 * a brand makes of that kind.
 */
const FAMILY_BY_CATEGORY = {
  driver: 'woods',
  'fairway-wood': 'woods',
  hybrid: 'woods',
  jernsaet: 'irons',
  wedge: 'wedge',
  putter: 'putter',
  bag: 'bag',
  sko: 'shoes',
  andet: 'other',
};

export const gearFamilyOf = categoryId => FAMILY_BY_CATEGORY[categoryId] || null;

/**
 * The brands shown as one-tap chips, per kind of gear. Anything else is one
 * tap further away, under "Andet mærke".
 */
const POPULAR_BRANDS = {
  woods: ['TaylorMade', 'Callaway', 'Titleist', 'PING', 'Cobra', 'Mizuno', 'Srixon', 'PXG'],
  irons: ['Mizuno', 'TaylorMade', 'Callaway', 'Titleist', 'PING', 'Srixon', 'Cobra', 'Wilson'],
  wedge: ['Titleist', 'Cleveland', 'Callaway', 'TaylorMade', 'PING', 'Mizuno'],
  putter: ['Scotty Cameron', 'Odyssey', 'PING', 'TaylorMade', 'L.A.B. Golf', 'Bettinardi'],
  bag: ['Sun Mountain', 'Big Max', 'Titleist', 'Callaway', 'TaylorMade', 'PING', 'Vessel', 'Ogio'],
  shoes: ['FootJoy', 'ECCO', 'adidas', 'Nike', 'Puma', 'Skechers', 'Under Armour'],
  other: ['Garmin', 'Bushnell', 'Shot Scope', 'Titleist', 'Callaway', 'TaylorMade'],
};

export const popularBrandsFor = categoryId =>
  POPULAR_BRANDS[gearFamilyOf(categoryId)] || GOLF_BRANDS.slice(0, 8);

/**
 * Model lines per brand and kind of gear, newest first.
 *
 * Only well-known lines: a suggestion that turns out not to exist is worse
 * than no suggestion. A brand or kind that is not here simply gets a plain
 * text field.
 */
const GEAR_MODELS = {
  TaylorMade: {
    woods: [
      'Qi35',
      'Qi35 Max',
      'Qi35 LS',
      'Qi10',
      'Qi10 Max',
      'Stealth 2',
      'Stealth 2 Plus',
      'Stealth',
      'SIM2 Max',
      'SIM2',
      'M6',
    ],
    irons: ['P790', 'P770', 'P7MC', 'P7MB', 'P7CB', 'Qi', 'Stealth', 'SIM2 Max'],
    wedge: ['MG4', 'MG3', 'Hi-Toe 3'],
    putter: ['Spider Tour', 'Spider Tour X', 'Spider GT', 'Spider X', 'TP Collection'],
  },
  Callaway: {
    woods: [
      'Elyte',
      'Elyte X',
      'Elyte Triple Diamond',
      'Paradym Ai Smoke Max',
      'Paradym Ai Smoke',
      'Paradym',
      'Rogue ST Max',
      'Epic Speed',
      'Mavrik',
      'Big Bertha',
    ],
    irons: [
      'Apex Pro',
      'Apex CB',
      'Apex MB',
      'Apex Ai200',
      'Apex Ai300',
      'Elyte',
      'Paradym Ai Smoke',
      'Rogue ST Max',
      'Mavrik',
      'Big Bertha',
    ],
    wedge: ['Opus', 'Jaws Raw', 'MD5 Jaws'],
  },
  Titleist: {
    woods: ['GT2', 'GT3', 'GT4', 'GT1', 'TSR2', 'TSR3', 'TSR4', 'TSi2', 'TSi3', 'TS2'],
    irons: ['T100', 'T150', 'T200', 'T350', '620 MB', '620 CB'],
    wedge: ['Vokey SM10', 'Vokey SM9', 'Vokey SM8', 'Vokey SM7'],
    bag: ['Players 4', 'Players 5', 'Hybrid 14', 'Cart 14'],
  },
  PING: {
    woods: [
      'G440 Max',
      'G440 LST',
      'G440 SFT',
      'G430 Max',
      'G430 LST',
      'G430 SFT',
      'G430 Max 10K',
      'G425 Max',
      'G410 Plus',
    ],
    irons: [
      'i530',
      'i230',
      'i525',
      'i210',
      'Blueprint S',
      'Blueprint T',
      'G440',
      'G430',
      'G425',
      'G710',
    ],
    wedge: ['s159', 'Glide 4.0', 'Glide 3.0'],
    putter: ['PLD Anser', 'Anser', 'Tyne', 'Fetch', 'DS72', 'Tomcat 14'],
    bag: ['Hoofer', 'Hoofer Lite', 'Hoofer 14', 'Pioneer'],
  },
  Mizuno: {
    woods: ['ST-Max 230', 'ST-Z 230', 'ST-X 230', 'ST-G'],
    irons: [
      'JPX925 Hot Metal',
      'JPX925 Forged',
      'JPX923 Hot Metal',
      'JPX923 Forged',
      'Pro 245',
      'Pro 243',
      'Pro 241',
      'JPX921 Hot Metal',
      'MP-20',
    ],
    wedge: ['T24', 'T22', 'S23', 'ES21'],
  },
  Cobra: {
    woods: [
      'DS-Adapt Max',
      'DS-Adapt LS',
      'Darkspeed Max',
      'Darkspeed',
      'Aerojet',
      'LTDx',
      'Radspeed',
    ],
    irons: ['King Tec', 'King Forged Tec', 'Darkspeed', 'Aerojet', 'LTDx', 'King One Length'],
  },
  Srixon: {
    woods: ['ZXi', 'ZXi LS', 'ZX5 Mk II', 'ZX7 Mk II', 'ZX5', 'ZX7'],
    irons: ['ZXi5', 'ZXi7', 'ZX5 Mk II', 'ZX7 Mk II', 'ZX4 Mk II', 'ZX5', 'ZX7'],
  },
  Cleveland: {
    wedge: [
      'RTZ',
      'RTX 6 ZipCore',
      'RTX ZipCore',
      'CBX 4 ZipCore',
      'Smart Sole 4',
      'CBX Full-Face',
    ],
    irons: ['Launcher XL', 'Launcher XL Halo', 'ZipCore XL'],
    putter: ['HB Soft 2', 'Frontline'],
  },
  Wilson: {
    woods: ['Dynapower', 'D9', 'Launch Pad'],
    irons: ['Staff Model CB', 'Staff Model Blade', 'Dynapower', 'D9', 'Launch Pad'],
  },
  XXIO: {
    woods: ['XXIO 13', 'XXIO 12', 'XXIO X', 'XXIO Eleven'],
    irons: ['XXIO 13', 'XXIO 12', 'XXIO X', 'XXIO Eleven'],
  },
  'Scotty Cameron': {
    putter: [
      'Newport 2',
      'Newport',
      'Phantom 5',
      'Phantom 7',
      'Phantom 11',
      'Phantom X',
      'Special Select',
      'Super Select',
      'Studio Style',
      'Fastback',
      'Squareback',
    ],
  },
  Odyssey: {
    putter: [
      'White Hot OG',
      'Ai-One',
      'Ai-One Milled',
      'Tri-Hot 5K',
      'Eleven',
      'Ten',
      '2-Ball',
      'Jailbird',
      'Toulon',
    ],
  },
  'L.A.B. Golf': {
    putter: ['DF3', 'Mezz.1 Max', 'Link.1', 'OZ.1'],
  },
  Bettinardi: {
    putter: ['Queen B', 'Studio Stock', 'BB Series', 'Inovai'],
  },
  Evnroll: {
    putter: ['ER2', 'ER5', 'ER1', 'Neo Classic'],
  },
  'Sun Mountain': {
    bag: ['C-130', '4.5LS', 'H2NO Lite', 'Eco-Lite', 'Sync', 'Maverick'],
  },
  'Big Max': {
    bag: ['Aqua', 'Dri Lite'],
  },
  Vessel: {
    bag: ['Player IV', 'Player V', 'Lux', 'VLS'],
  },
  Motocaddy: {
    bag: ['M1', 'M3 GPS', 'M5 GPS', 'M7 Remote', 'Pro 3000'],
  },
  PowaKaddy: {
    bag: ['CT6 GPS', 'CT8 GPS', 'FX7 GPS'],
  },
  FootJoy: {
    shoes: [
      'Premiere Series',
      'Pro/SL',
      'Pro/SLX',
      'HyperFlex',
      'Fuel',
      'Tour Alpha',
      'Quantum',
      'Flex',
    ],
  },
  ECCO: {
    shoes: ['Biom H4', 'Biom H5', 'Biom C4', 'Biom G5', 'Core', 'LT1'],
  },
  adidas: {
    shoes: ['Tour360', 'CodeChaos', 'S2G', 'ZG23', 'Retrocross', 'MC87'],
  },
  Nike: {
    shoes: ['Air Jordan 1 Low G', 'Air Max 90 G', 'Infinity Tour', 'Victory Pro'],
  },
  Puma: {
    shoes: ['Phantomcat Nitro', 'Fusion Crush', 'Ignite Elevate', 'GS-Fast'],
  },
  Skechers: {
    shoes: ['Go Golf Elite 5', 'Go Golf Max', 'Go Golf Arch Fit'],
  },
  Garmin: {
    other: [
      'Approach S70',
      'Approach S62',
      'Approach S44',
      'Approach S12',
      'Approach Z30',
      'Approach Z82',
      'Approach G80',
      'Approach CT10',
      'Approach R10',
    ],
  },
  Bushnell: {
    other: ['Pro X3', 'Pro X3+', 'Tour V6', 'Tour V6 Shift', 'Tour V5', 'Pro XE', 'Launch Pro'],
  },
  'Shot Scope': {
    other: ['Pro L2', 'Pro LX+', 'V5', 'H5', 'X5', 'G5'],
  },
};

// "taylor made", "Taylor-Made" and "TAYLORMADE" are all the same brand
const brandKey = value =>
  typeof value === 'string' ? value.toLowerCase().replace(/[\s.\-_'’]/g, '') : '';

/**
 * The brand as we spell it, when what was typed is one we know.
 *
 * @param {string} value - What the seller typed
 * @param {Array<string>} [brands] - Known brands, GOLF_BRANDS by default
 * @returns {string} The known spelling, or the input trimmed
 */
export const canonicalBrand = (value, brands = GOLF_BRANDS) => {
  const trimmed = typeof value === 'string' ? value.trim().replace(/\s+/g, ' ') : '';
  const key = brandKey(trimmed);
  if (!key) {
    return trimmed;
  }
  return brands.find(brand => brandKey(brand) === key) || trimmed;
};

/**
 * Model lines worth suggesting for a brand, in the kind of gear being sold.
 *
 * @param {string} brand - The brand, spelt any way
 * @param {string} categoryId - The listing's category
 * @returns {Array<string>} Newest first; empty when we have nothing to offer
 */
export const modelSuggestionsFor = (brand, categoryId) => {
  const known = GEAR_MODELS[canonicalBrand(brand)];
  const family = gearFamilyOf(categoryId);
  return (known && family && known[family]) || [];
};

/**
 * Which set of irons, in the shorthand golfers use.
 */
export const IRON_SET_SUGGESTIONS = ['4–PW', '5–PW', '6–PW', '5–GW', '4–GW', '5–SW'];

// Degrees from an option like '10-5'
const loftDegrees = option => Number.parseFloat(`${option}`.replace('-', '.'));

/**
 * The lofts that exist for each kind of wood. Drivers stop at 12°, fairway
 * woods live between 13° and 21°, hybrids between 16.5° and 27°. Showing
 * every loft from 8° to 27° for a driver was a wall of options where two
 * thirds could never be right.
 */
const LOFT_RANGES = {
  driver: [8, 12],
  'fairway-wood': [13, 21],
  hybrid: [16.5, 27],
};

/**
 * Keep the loft options that make sense for the category. A value already
 * saved outside the range stays, so an unusual club is never silently changed.
 *
 * @param {Array<{ option: string, label: string }>} enumOptions - All lofts
 * @param {string} categoryId - The listing's category
 * @param {string} [currentValue] - The saved loft, kept whatever the range
 * @returns {Array<{ option: string, label: string }>}
 */
export const loftOptionsFor = (enumOptions = [], categoryId, currentValue) => {
  const range = LOFT_RANGES[categoryId];
  if (!range) {
    return enumOptions;
  }
  const [min, max] = range;
  return enumOptions.filter(({ option }) => {
    const degrees = loftDegrees(option);
    return option === currentValue || (degrees >= min && degrees <= max);
  });
};

/**
 * The order the questions come in: what it is, then its details, then how
 * worn it is. Fields we do not know (added in Console later) come after the
 * details, before the condition.
 */
export const FIELD_ORDER = [
  'brand',
  'model',
  'dexterity',
  'loft',
  'wedge_loft',
  'iron_set',
  'shaft_flex',
  'shaft_material',
  'shaft_model',
  'putter_type',
  'putter_length',
  'shoe_size',
];
export const LAST_FIELDS = ['condition'];

export const fieldRank = key => {
  if (LAST_FIELDS.includes(key)) {
    return 1000 + LAST_FIELDS.indexOf(key);
  }
  const at = FIELD_ORDER.indexOf(key);
  return at >= 0 ? at : 500;
};

/**
 * Where the fields fall into groups, for spacing and a heading each:
 * brand and model name the thing, the rest describe it, condition is last.
 */
export const fieldGroupOf = key =>
  ['brand', 'model'].includes(key) ? 'identity' : LAST_FIELDS.includes(key) ? 'condition' : 'specs';

const TITLE_MAX = 60;

const clean = value => (typeof value === 'string' ? value.trim().replace(/\s+/g, ' ') : '');

const labelOf = (fieldConfigs, key, value) => {
  if (value == null || value === '') {
    return '';
  }
  const config = fieldConfigs.find(c => c.key === key);
  const match = config?.enumOptions?.find(o => `${o.option}` === `${value}`);
  return match ? `${match.label}` : '';
};

/**
 * The listing title, written from the answers so the seller only has to read it.
 *
 * "PING G430 Max driver · 10.5° · Stiff". Brand and model first because that
 * is what people search for, then the kind of club unless the model already
 * says it, then the details a buyer checks first. Kept within 60 characters by
 * dropping the least important detail first.
 *
 * @param {Object} params
 * @param {Object} params.values - The form values (pub_brand, pub_model, …)
 * @param {Array<Object>} params.fieldConfigs - Listing field configurations, for option labels
 * @param {string} params.categoryId - The listing's category
 * @param {Function} params.text - (id, values) => string, for the words around the answers
 * @returns {string} The title, or '' while there is no brand yet
 */
export const composeListingTitle = ({ values = {}, fieldConfigs = [], categoryId, text }) => {
  const brand = clean(values.pub_brand);
  if (!brand) {
    return '';
  }
  const model = clean(values.pub_model);
  const say = (id, vars) => (text ? text(id, vars) : '') || '';
  const noun = categoryId ? say(`FairwayGear.titleNoun.${categoryId}`) : '';
  const named = [brand, model].filter(Boolean).join(' ');
  const nounIsNew = noun && !named.toLowerCase().includes(noun.toLowerCase());
  const head = nounIsNew ? `${named} ${noun}` : named;

  const lab = key => labelOf(fieldConfigs, key, values[`pub_${key}`]);
  const shortLoft = label => label.replace('.0°', '°');
  const family = gearFamilyOf(categoryId);

  // Most important first: the end of this list is dropped first
  const details = [
    family === 'woods' ? shortLoft(lab('loft')) : '',
    family === 'wedge' ? lab('wedge_loft') : '',
    family === 'irons' ? clean(values.pub_iron_set) : '',
    family === 'putter' ? lab('putter_length') : '',
    family === 'shoes' && lab('shoe_size')
      ? say('FairwayGear.titleShoeSize', { size: lab('shoe_size') })
      : '',
    values.pub_dexterity === 'left' ? say('FairwayGear.titleLeft') : '',
    ['woods', 'irons', 'wedge'].includes(family) ? lab('shaft_flex') : '',
  ].filter(Boolean);

  const join = parts => [head, ...parts].join(' · ');
  let kept = details;
  while (kept.length > 0 && join(kept).length > TITLE_MAX) {
    kept = kept.slice(0, -1);
  }
  const title = join(kept);
  return title.length > TITLE_MAX ? title.slice(0, TITLE_MAX).trim() : title;
};

/**
 * The photos a buyer wants to see, in the order to take them, per kind of
 * gear. The photos step shows the ones still missing as empty slots, so the
 * seller works down a shot list instead of guessing what "good photos" means.
 * Each id is a message: EditListingPhotosForm.shot.<id>.
 */
const SHOT_LISTS = {
  woods: ['whole', 'headTop', 'face', 'sole', 'grip', 'marks'],
  wedge: ['whole', 'headTop', 'face', 'sole', 'grip', 'marks'],
  irons: ['wholeSet', 'faces', 'soles', 'backs', 'grips', 'marks'],
  putter: ['whole', 'headTop', 'face', 'sole', 'grip', 'headcover'],
  bag: ['wholeBag', 'front', 'back', 'pockets', 'bottom', 'marks'],
  shoes: ['pairSide', 'top', 'soles', 'heels', 'inside', 'sizeLabel'],
  other: ['wholeItem', 'front', 'back', 'details', 'accessories', 'marks'],
};

export const shotListFor = categoryId => SHOT_LISTS[gearFamilyOf(categoryId)] || SHOT_LISTS.other;

/**
 * Sentences buyers ask about, per kind of gear, offered as one-tap chips on
 * the description step. Each id is a message:
 * EditListingDescriptionPanel.phrase.<id>.
 */
const DESCRIPTION_PHRASES = {
  woods: ['headcover', 'originalShaft', 'newGrip', 'noDamage', 'oneSeason', 'receipt'],
  irons: ['originalShaft', 'newGrip', 'noDamage', 'oneSeason', 'grooves', 'receipt'],
  wedge: ['grooves', 'newGrip', 'noDamage', 'oneSeason', 'receipt'],
  putter: ['headcover', 'newGrip', 'faceClean', 'noDamage', 'receipt'],
  bag: ['raincover', 'standWorks', 'zipsWork', 'noTears'],
  shoes: ['fewRounds', 'newSpikes', 'smokeFree', 'box'],
  other: ['charger', 'box', 'worksPerfectly', 'receipt'],
};

export const descriptionPhrasesFor = categoryId =>
  DESCRIPTION_PHRASES[gearFamilyOf(categoryId)] || DESCRIPTION_PHRASES.other;

/**
 * The description with one more sentence at the end, punctuated.
 *
 * @param {string} text - What is written so far
 * @param {string} sentence - The sentence to add, without a full stop
 * @returns {string}
 */
export const appendSentence = (text, sentence) => {
  const current = typeof text === 'string' ? text.trimEnd() : '';
  if (!current) {
    return `${sentence}.`;
  }
  const ended = /[.!?]$/.test(current);
  return `${current}${ended ? '' : '.'} ${sentence}.`;
};
