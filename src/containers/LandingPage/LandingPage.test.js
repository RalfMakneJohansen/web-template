import React from 'react';
import '@testing-library/jest-dom';

import { createListing } from '../../util/testData';
import { renderWithProviders as render, testingLibrary } from '../../util/testHelpers';

import { LandingPageComponent } from './LandingPage';

const { screen } = testingLibrary;

/**
 * FAIRWAY: the front page is hand-built rather than assembled from Console page
 * assets, so these check the page we actually ship — and above all that it
 * renders at all when the listing fetch has not come back, or failed.
 */
describe('LandingPage', () => {
  it('renders the hero before any listings have arrived', () => {
    render(<LandingPageComponent scrollingDisabled={false} />);

    expect(screen.getByText('Brugt golfudstyr · Danmark')).toBeInTheDocument();
    expect(screen.getByText('Vi sender labelen')).toBeInTheDocument();
    expect(screen.getByText('Klar til at sælge?')).toBeInTheDocument();
  });

  it('tells the visitor when the listings could not be fetched, and still renders the page', () => {
    const fetchError = new Error('LandingPage failed');

    render(
      <LandingPageComponent listings={[]} fetchError={fetchError} scrollingDisabled={false} />
    );

    expect(
      screen.getByText('Vi kunne ikke hente annoncerne lige nu. Prøv at genindlæse siden.')
    ).toBeInTheDocument();
    expect(screen.getByText('Klar til at sælge?')).toBeInTheDocument();
  });

  it('shows a listing row once there are listings', () => {
    const listings = [createListing('l1'), createListing('l2')];

    render(<LandingPageComponent listings={listings} scrollingDisabled={false} />);

    expect(screen.getByText('Lige lagt op')).toBeInTheDocument();
    expect(screen.getAllByText('l1 title').length).toBeGreaterThan(0);
  });

  it('leaves out a row that has nothing to put in it', () => {
    render(<LandingPageComponent listings={[]} scrollingDisabled={false} />);

    expect(screen.queryByText('Lige lagt op')).not.toBeInTheDocument();
  });
});
