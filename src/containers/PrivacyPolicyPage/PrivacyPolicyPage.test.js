import React from 'react';
import '@testing-library/jest-dom';

import { renderWithProviders as render, testingLibrary } from '../../util/testHelpers';

import { PrivacyPolicyPageComponent } from './PrivacyPolicyPage';

const { waitFor } = testingLibrary;

describe('PrivacyPolicyPage', () => {
  // FAIRWAY: the page renders our own text, so a failed Console fetch no
  // longer leaves the visitor on an error page
  it('renders the Fairway text even when the asset fetch fails', async () => {
    const errorMessage = 'PrivacyPolicyPage failed';
    let e = new Error(errorMessage);
    e.type = 'error';
    e.name = 'Test';

    const { getByText, getByRole } = render(
      <PrivacyPolicyPageComponent pageAssetsData={null} inProgress={false} error={e} />
    );

    // The full text is long, so give the markdown time to render
    await waitFor(
      () => {
        expect(getByRole('heading', { level: 1, name: 'Privatlivspolitik' })).toBeInTheDocument();
        expect(getByText('6. Dine rettigheder')).toBeInTheDocument();
      },
      { timeout: 20000 }
    );
  }, 30000);
});
