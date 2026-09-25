import React from 'react';
import '@testing-library/jest-dom';

import { renderWithProviders as render, testingLibrary } from '../../util/testHelpers';

import FairwayFooter from './FairwayFooter';

const { screen } = testingLibrary;

describe('FairwayFooter', () => {
  it('shows the newsletter and hides social icons without addresses', () => {
    render(<FairwayFooter socialLinks={{ facebook: null, instagram: null }} />);
    expect(screen.getByText('NewsletterSignup.title')).toBeInTheDocument();
    expect(screen.queryByText('FairwayFooter.followUs')).not.toBeInTheDocument();
  });

  it('links to the social profiles that are set', () => {
    render(
      <FairwayFooter
        socialLinks={{ facebook: 'https://www.facebook.com/fairway', instagram: null }}
      />
    );
    expect(screen.getByText('FairwayFooter.followUs')).toBeInTheDocument();
    const links = screen.getAllByRole('link', { name: 'FairwayFooter.followOn' });
    expect(links).toHaveLength(1);
    expect(links[0]).toHaveAttribute('href', 'https://www.facebook.com/fairway');
  });
});
