import React from 'react';
import '@testing-library/jest-dom';

import { renderWithProviders as render, testingLibrary } from '../../../util/testHelpers';

import WizardStepper from './WizardStepper';

const { screen } = testingLibrary;

const steps = ['details', 'pricing', 'shipping', 'photos'].map(key => ({
  key,
  label: `label-${key}`,
  linkProps: { name: 'LandingPage' },
  reachable: true,
}));

describe('WizardStepper', () => {
  it('shows how far along you are and marks the current step', () => {
    render(<WizardStepper steps={steps} currentIndex={2} />);

    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '50');
    const current = screen.getByText('label-shipping').closest('li');
    expect(current).toHaveAttribute('aria-current', 'step');
  });

  it('lets you go back to finished steps but not jump ahead', () => {
    render(<WizardStepper steps={steps} currentIndex={2} />);

    expect(screen.getByText('label-details').closest('a')).toBeInTheDocument();
    expect(screen.getByText('label-pricing').closest('a')).toBeInTheDocument();
    expect(screen.getByText('label-photos').closest('a')).toBeNull();
  });
});
