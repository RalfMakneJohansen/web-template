import React from 'react';
import '@testing-library/jest-dom';

import { createCurrentUser } from '../../util/testData';
import { renderWithProviders as render, testingLibrary } from '../../util/testHelpers';

import TradingGuidePage from './TradingGuidePage';

const { screen } = testingLibrary;

describe('TradingGuidePage', () => {
  it('shows the checklist, both sides of a trade, Stripe and the sender form', () => {
    render(<TradingGuidePage />, {
      initialState: { user: { currentUser: createCurrentUser('user1') } },
    });

    expect(
      screen.getByRole('heading', { level: 1, name: 'TradingGuidePage.heading' })
    ).toBeInTheDocument();
    expect(screen.getByText('TradeReadiness.guide.title')).toBeInTheDocument();
    expect(screen.getByText('TradingGuidePage.seller.payout.title')).toBeInTheDocument();
    expect(screen.getByText('TradingGuidePage.buyer.approve.title')).toBeInTheDocument();
    expect(screen.getByText('TradingGuidePage.stripe.identity.title')).toBeInTheDocument();
    expect(screen.getByLabelText('SenderAddressFields.line1')).toBeInTheDocument();
    // Prefilled from the account name
    expect(screen.getByLabelText('SenderAddressFields.name')).toHaveValue(
      'user1 first name user1 last name'
    );
  });
});
