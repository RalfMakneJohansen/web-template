import React from 'react';
import '@testing-library/jest-dom';

import { createCurrentUser } from '../../util/testData';
import { renderWithProviders as render, testingLibrary } from '../../util/testHelpers';

import TradeReadiness from './TradeReadiness';

const { screen } = testingLibrary;

const sellerWith = ({ emailVerified = true, sender = false, payout = false } = {}) => {
  const base = createCurrentUser('seller');
  const protectedData = sender
    ? {
        phoneNumber: '+45 12 34 56 78',
        senderAddress: { name: 'Mette', line1: 'Vej 1', postalCode: '2100', city: 'Kbh' },
      }
    : {};
  return {
    ...base,
    attributes: {
      ...base.attributes,
      emailVerified,
      profile: { ...base.attributes.profile, protectedData },
    },
    ...(payout ? { stripeAccount: { id: { uuid: 'acct' } } } : {}),
  };
};

describe('TradeReadiness', () => {
  it('lists what is missing, with a link to fix each', () => {
    render(<TradeReadiness currentUser={sellerWith({ emailVerified: false })} context="profile" />);

    expect(screen.getByText('TradeReadiness.profile.title')).toBeInTheDocument();
    expect(screen.getByText('TradeReadiness.email.todo')).toBeInTheDocument();
    expect(screen.getByText('TradeReadiness.sender.todo')).toBeInTheDocument();
    expect(screen.getByText('TradeReadiness.payout.todo')).toBeInTheDocument();
    expect(screen.getByText('TradeReadiness.payout.cta').closest('a')).toHaveAttribute(
      'href',
      '/account/payments'
    );
    expect(screen.getByText('TradeReadiness.sender.cta').closest('a')).toHaveAttribute(
      'href',
      '/account/guide#afsender'
    );
  });

  it('shows done items without a link, and the ready heading when complete', () => {
    render(
      <TradeReadiness currentUser={sellerWith({ sender: true, payout: true })} context="profile" />
    );

    expect(screen.getByText('TradeReadiness.profile.readyTitle')).toBeInTheDocument();
    expect(screen.getByText('TradeReadiness.payout.done')).toBeInTheDocument();
    expect(screen.queryByText('TradeReadiness.payout.cta')).not.toBeInTheDocument();
  });

  it('tells buyers they need nothing in advance', () => {
    render(<TradeReadiness currentUser={sellerWith()} context="guide" />);

    expect(screen.getByText('TradeReadiness.buyerNote')).toBeInTheDocument();
    // On the guide itself there is no link back to the guide
    expect(screen.queryByText('TradeReadiness.guideLink')).not.toBeInTheDocument();
  });

  it('renders nothing without a user', () => {
    const { container } = render(<TradeReadiness currentUser={null} />);
    expect(container).toBeEmptyDOMElement();
  });
});
