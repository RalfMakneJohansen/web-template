import React from 'react';
import '@testing-library/jest-dom';

import { renderWithProviders as render, testingLibrary } from '../../util/testHelpers';

import { TermsOfServicePageComponent } from './TermsOfServicePage';

const { waitFor } = testingLibrary;

describe('TermsOfServicePage', () => {
  // FAIRWAY: the page renders our own text, so a failed Console fetch no
  // longer leaves the visitor on an error page
  it('renders the Fairway text even when the asset fetch fails', async () => {
    const errorMessage = 'TermsOfServicePage failed';
    let e = new Error(errorMessage);
    e.type = 'error';
    e.name = 'Test';

    const { getByText, getByRole } = render(
      <TermsOfServicePageComponent pageAssetsData={null} inProgress={false} error={e} />
    );

    // The full text is long, so give the markdown time to render
    await waitFor(
      () => {
        expect(getByRole('heading', { level: 1, name: 'Handelsbetingelser' })).toBeInTheDocument();
        expect(getByText('5. Betaling og køberbeskyttelse')).toBeInTheDocument();
      },
      { timeout: 20000 }
    );
  }, 30000);
});
