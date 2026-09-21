import React from 'react';
import '@testing-library/jest-dom';
import { screen } from '@testing-library/react';

import { getHostedConfiguration, renderWithProviders as render } from '../../util/testHelpers';
import { createListing, createUser } from '../../util/testData';

import FairwayListingCard from './FairwayListingCard';

/**
 * The card is the most-rendered component on the site — every cell of the
 * search grid, the rows on the front page and the related listings under an
 * annonce are all this one file. It had no tests at all.
 *
 * These cover the title, which is assembled rather than printed, and that is
 * where it can go wrong.
 */

const author = createUser('user1');

// Two specs the card pulls into the title. The labels are read off the
// listing field config, so they are added to the hosted config the rest of
// the suite uses rather than standing in for it — a bare object here breaks
// the search config that every render builds.
const getConfig = () => {
  const hosted = getHostedConfiguration();
  const field = (key, label, enumOptions) => ({
    key,
    label,
    enumOptions,
    scope: 'public',
    schemaType: 'enum',
    filterConfig: { showFilter: false },
    saveConfig: { required: false },
  });

  return {
    ...hosted,
    listingFields: {
      listingFields: [
        ...hosted.listingFields.listingFields,
        field('shaft_flex', 'Flex', [
          { option: 'regular', label: 'Regular' },
          { option: 'stiff', label: 'Stiff' },
        ]),
        field('loft', 'Loft', [{ option: '10_5', label: '10.5°' }]),
      ],
    },
  };
};

describe('FairwayListingCard', () => {
  it('puts the deciding specs in the title, after the name', () => {
    const listing = createListing(
      'listing1',
      {
        title: 'Titleist GT4 Driver',
        publicData: { shaft_flex: 'regular', loft: '10_5' },
      },
      { author }
    );

    render(<FairwayListingCard listing={listing} />, { config: getConfig() });

    expect(screen.getByText('Titleist GT4 Driver / Regular / 10.5°')).toBeInTheDocument();
  });

  it('does not start the title with a separator when there is no name', () => {
    // A listing with neither a title nor a model. This used to render
    // " / Regular", because the parts were joined without being filtered.
    const listing = createListing(
      'listing1',
      { title: '', publicData: { shaft_flex: 'regular' } },
      { author }
    );

    render(<FairwayListingCard listing={listing} />, { config: getConfig() });

    const title = screen.getByText(/Regular/);
    expect(title.textContent).toEqual('Regular');
    expect(title.textContent.startsWith('/')).toBe(false);
  });

  it('falls back to the model when the listing has no title', () => {
    const listing = createListing(
      'listing1',
      { title: '', publicData: { model: 'GT4', shaft_flex: 'stiff' } },
      { author }
    );

    render(<FairwayListingCard listing={listing} />, { config: getConfig() });

    expect(screen.getByText('GT4 / Stiff')).toBeInTheDocument();
  });

  it('shows the condition in Danish', () => {
    const listing = createListing(
      'listing1',
      { title: 'Ping G440', publicData: { condition: 'som-ny' } },
      { author }
    );

    render(<FairwayListingCard listing={listing} />, { config: getConfig() });

    expect(screen.getByText('Som ny')).toBeInTheDocument();
  });

  it('leaves the badge off when the condition is not set', () => {
    const listing = createListing('listing1', { title: 'Ping G440' }, { author });

    render(<FairwayListingCard listing={listing} />, { config: getConfig() });

    expect(screen.queryByText('Som ny')).not.toBeInTheDocument();
    expect(screen.queryByText('God')).not.toBeInTheDocument();
  });
});
