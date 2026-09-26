import {
  GOLF_BRANDS,
  appendSentence,
  canonicalBrand,
  composeListingTitle,
  descriptionPhrasesFor,
  fieldGroupOf,
  fieldRank,
  loftOptionsFor,
  modelSuggestionsFor,
  popularBrandsFor,
  shotListFor,
} from './fairwayGear';

const LOFTS = [
  '8-0',
  '9-0',
  '10-5',
  '12-0',
  '13-0',
  '15-0',
  '16-5',
  '19-0',
  '21-0',
  '24-0',
  '27-0',
].map(option => ({ option, label: `${option.replace('-', '.')}°` }));

const FIELD_CONFIGS = [
  { key: 'loft', enumOptions: LOFTS },
  {
    key: 'shaft_flex',
    enumOptions: [{ option: 'regular', label: 'Regular' }, { option: 'stiff', label: 'Stiff' }],
  },
  { key: 'wedge_loft', enumOptions: [{ option: '56', label: '56°' }] },
  { key: 'shoe_size', enumOptions: [{ option: '43', label: '43' }] },
  { key: 'putter_length', enumOptions: [{ option: '34', label: '34"' }] },
];

const WORDS = {
  'FairwayGear.titleNoun.driver': 'driver',
  'FairwayGear.titleNoun.wedge': 'wedge',
  'FairwayGear.titleNoun.putter': 'putter',
  'FairwayGear.titleNoun.sko': 'golfsko',
  'FairwayGear.titleNoun.jernsaet': 'jernsæt',
  'FairwayGear.titleLeft': 'Venstrehåndet',
};
const text = (id, values) =>
  id === 'FairwayGear.titleShoeSize' ? `str. ${values.size}` : WORDS[id] || '';

describe('canonicalBrand', () => {
  it('spells a known brand the way the maker does', () => {
    expect(canonicalBrand('taylor made')).toEqual('TaylorMade');
    expect(canonicalBrand('ping')).toEqual('PING');
    expect(canonicalBrand('lab golf')).toEqual('L.A.B. Golf');
  });

  it('leaves an unknown brand as it was written, trimmed', () => {
    expect(canonicalBrand('  Lille  Smedje ')).toEqual('Lille Smedje');
  });

  it('copes with nothing', () => {
    expect(canonicalBrand(undefined)).toEqual('');
  });
});

describe('popular brands and models', () => {
  it('shows putter makers for a putter and club makers for a driver', () => {
    expect(popularBrandsFor('putter')).toContain('Scotty Cameron');
    expect(popularBrandsFor('driver')).not.toContain('Scotty Cameron');
    expect(popularBrandsFor('driver')).toContain('TaylorMade');
  });

  it('falls back to the most common brands for an unknown category', () => {
    expect(popularBrandsFor('unknown')).toEqual(GOLF_BRANDS.slice(0, 8));
  });

  it('suggests the models a brand makes of this kind of gear', () => {
    expect(modelSuggestionsFor('PING', 'driver')).toContain('G430 Max');
    expect(modelSuggestionsFor('ping', 'wedge')).toContain('Glide 4.0');
    expect(modelSuggestionsFor('Titleist', 'wedge')).toContain('Vokey SM10');
  });

  it('suggests nothing it does not know', () => {
    expect(modelSuggestionsFor('Lille Smedje', 'driver')).toEqual([]);
    expect(modelSuggestionsFor('Scotty Cameron', 'driver')).toEqual([]);
    expect(modelSuggestionsFor('', undefined)).toEqual([]);
  });
});

describe('loftOptionsFor', () => {
  const options = category => loftOptionsFor(LOFTS, category).map(o => o.option);

  it('keeps only the lofts that exist for the kind of wood', () => {
    expect(options('driver')).toEqual(['8-0', '9-0', '10-5', '12-0']);
    expect(options('fairway-wood')).toEqual(['13-0', '15-0', '16-5', '19-0', '21-0']);
    expect(options('hybrid')).toEqual(['16-5', '19-0', '21-0', '24-0', '27-0']);
  });

  it('keeps a saved loft outside the range, so nothing is silently changed', () => {
    const kept = loftOptionsFor(LOFTS, 'driver', '15-0').map(o => o.option);
    expect(kept).toContain('15-0');
  });

  it('leaves the list alone for other categories', () => {
    expect(loftOptionsFor(LOFTS, 'wedge')).toEqual(LOFTS);
  });
});

describe('field order', () => {
  it('asks what it is, then the details, then the condition', () => {
    const keys = ['condition', 'shaft_flex', 'unknown', 'brand', 'loft', 'model'];
    const sorted = [...keys].sort((a, b) => fieldRank(a) - fieldRank(b));
    expect(sorted).toEqual(['brand', 'model', 'loft', 'shaft_flex', 'unknown', 'condition']);
  });

  it('groups the fields', () => {
    expect(fieldGroupOf('brand')).toEqual('identity');
    expect(fieldGroupOf('loft')).toEqual('specs');
    expect(fieldGroupOf('condition')).toEqual('condition');
  });
});

describe('composeListingTitle', () => {
  const compose = (values, categoryId) =>
    composeListingTitle({ values, fieldConfigs: FIELD_CONFIGS, categoryId, text });

  it('waits for a brand', () => {
    expect(
      compose(
        { pub_model: 'G430' },
        'driver'
      )
    ).toEqual('');
  });

  it('names a driver with its loft and flex', () => {
    const values = {
      pub_brand: 'PING',
      pub_model: 'G430 Max',
      pub_loft: '10-5',
      pub_shaft_flex: 'stiff',
    };
    expect(
      compose(
        values,
        'driver'
      )
    ).toEqual('PING G430 Max driver · 10.5° · Stiff');
  });

  it('writes whole lofts without the .0', () => {
    const values = { pub_brand: 'TaylorMade', pub_model: 'Qi10', pub_loft: '9-0' };
    expect(
      compose(
        values,
        'driver'
      )
    ).toEqual('TaylorMade Qi10 driver · 9°');
  });

  it('does not repeat the kind of club when the model already says it', () => {
    const values = { pub_brand: 'Odyssey', pub_model: 'White Hot OG putter' };
    expect(
      compose(
        values,
        'putter'
      )
    ).toEqual('Odyssey White Hot OG putter');
  });

  it('mentions left-handed clubs', () => {
    const values = {
      pub_brand: 'Titleist',
      pub_model: 'Vokey SM10',
      pub_wedge_loft: '56',
      pub_dexterity: 'left',
    };
    expect(
      compose(
        values,
        'wedge'
      )
    ).toEqual('Titleist Vokey SM10 wedge · 56° · Venstrehåndet');
  });

  it('gives shoes their size', () => {
    const values = { pub_brand: 'FootJoy', pub_model: 'Premiere Series', pub_shoe_size: '43' };
    expect(
      compose(
        values,
        'sko'
      )
    ).toEqual('FootJoy Premiere Series golfsko · str. 43');
  });

  it('ignores specs that belong to another category', () => {
    const values = {
      pub_brand: 'PING',
      pub_model: 'Anser',
      pub_loft: '10-5',
      pub_putter_length: '34',
    };
    expect(
      compose(
        values,
        'putter'
      )
    ).toEqual('PING Anser putter · 34"');
  });

  it('stays within 60 characters by dropping the least important detail', () => {
    const values = {
      pub_brand: 'Callaway',
      pub_model: 'Paradym Ai Smoke Max Triple Diamond',
      pub_loft: '10-5',
      pub_shaft_flex: 'regular',
    };
    const title = compose(
      values,
      'driver'
    );
    expect(title.length).toBeLessThanOrEqual(60);
    expect(title).toEqual('Callaway Paradym Ai Smoke Max Triple Diamond driver · 10.5°');
  });
});

describe('shot lists and phrases', () => {
  it('asks for the face and sole of a club, and the soles of shoes', () => {
    expect(shotListFor('driver')).toEqual(expect.arrayContaining(['face', 'sole']));
    expect(shotListFor('sko')).toContain('soles');
    expect(shotListFor(undefined)).toContain('wholeItem');
  });

  it('offers sentences that fit the gear', () => {
    expect(descriptionPhrasesFor('driver')).toContain('headcover');
    expect(descriptionPhrasesFor('bag')).toContain('raincover');
  });

  it('adds a sentence with the right punctuation', () => {
    expect(appendSentence('', 'Nyt greb')).toEqual('Nyt greb.');
    expect(appendSentence('Spillet to sæsoner', 'Nyt greb')).toEqual(
      'Spillet to sæsoner. Nyt greb.'
    );
    expect(appendSentence('Spillet to sæsoner!  ', 'Nyt greb')).toEqual(
      'Spillet to sæsoner! Nyt greb.'
    );
  });
});
