import React from 'react';
import '@testing-library/jest-dom';

import { createCurrentUser } from '../../util/testData';
import { renderWithProviders as render, testingLibrary } from '../../util/testHelpers';

import { summariseRatings } from './ListingPage.duck';
import { shouldFold } from './ListingDescription';
import SaveListingButton from './SaveListingButton';

const { screen } = testingLibrary;

describe('seller rating', () => {
  it('averages public ratings to one decimal', () => {
    const reviews = [5, 4, 5].map(rating => ({ attributes: { rating } }));
    expect(summariseRatings(reviews)).toEqual({ average: 4.7, count: 3 });
  });

  it('has no average without reviews, and ignores junk', () => {
    expect(summariseRatings([])).toEqual({ average: null, count: 0 });
    expect(summariseRatings([{ attributes: { rating: 9 } }])).toEqual({ average: null, count: 0 });
  });
});

describe('description folding', () => {
  it('folds long or many-lined descriptions only', () => {
    expect(shouldFold('Kort og godt.')).toBe(false);
    expect(shouldFold('x'.repeat(400))).toBe(true);
    expect(shouldFold('1\n2\n3\n4\n5\n6\n7')).toBe(true);
    expect(shouldFold(null)).toBe(false);
  });
});

describe('SaveListingButton', () => {
  const userWith = favoriteListingIds =>
    createCurrentUser('me', { profile: { privateData: { favoriteListingIds } } });

  it('shows a saved listing as saved', () => {
    render(<SaveListingButton listingId="abc" compact />, {
      initialState: { auth: { isAuthenticated: true }, user: { currentUser: userWith(['abc']) } },
    });
    const button = screen.getByRole('button', { name: 'SaveListingButton.saved' });
    expect(button).toHaveAttribute('aria-pressed', 'true');
  });

  it('shows an unsaved listing as not saved', () => {
    render(<SaveListingButton listingId="xyz" compact />, {
      initialState: { auth: { isAuthenticated: true }, user: { currentUser: userWith(['abc']) } },
    });
    expect(screen.getByRole('button', { name: 'SaveListingButton.save' })).toHaveAttribute(
      'aria-pressed',
      'false'
    );
  });
});
