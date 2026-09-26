import React from 'react';
import '@testing-library/jest-dom';

import { types as sdkTypes } from '../../util/sdkLoader';
import { createCurrentUser, createUser } from '../../util/testData';
import { renderWithProviders as render, testingLibrary } from '../../util/testHelpers';

import OverviewPage from './OverviewPage';

const { UUID, Money } = sdkTypes;
const { screen } = testingLibrary;

const ref = (id, type) => ({ id: new UUID(id), type });

// Entities are kept normalised in marketplaceData, with relationships as refs.
const entities = {
  ownListing: {
    l1: {
      id: new UUID('l1'),
      type: 'ownListing',
      attributes: {
        title: 'Ping G425 driver',
        state: 'published',
        price: new Money(150000, 'DKK'),
      },
      relationships: {},
    },
  },
  listing: {
    l2: {
      id: new UUID('l2'),
      type: 'listing',
      attributes: { title: 'Scotty Cameron putter', state: 'published' },
      relationships: {},
    },
  },
  user: {
    buyer: createUser('buyer', { profile: { displayName: 'Ole H', abbreviatedName: 'OH' } }),
  },
  transaction: {
    t1: {
      id: new UUID('t1'),
      type: 'transaction',
      attributes: {
        processName: 'default-purchase',
        lastTransition: 'transition/confirm-payment',
        lastTransitionedAt: new Date(),
        payoutTotal: new Money(200000, 'DKK'),
        payinTotal: new Money(215000, 'DKK'),
        metadata: {},
      },
      relationships: {
        listing: { data: ref('l2', 'listing') },
        customer: { data: ref('buyer', 'user') },
      },
    },
  },
};

const initialState = (overrides = {}) => ({
  user: {
    currentUser: createCurrentUser('me', {
      profile: { firstName: 'Petra', lastName: 'M', displayName: 'Petra M', abbreviatedName: 'PM' },
    }),
  },
  marketplaceData: { entities },
  OverviewPage: {
    listingRefs: [ref('l1', 'ownListing')],
    listingCount: 1,
    saleRefs: [ref('t1', 'transaction')],
    orderRefs: [],
    loadInProgress: false,
    loadError: null,
    ...overrides,
  },
});

describe('OverviewPage', () => {
  it('greets you, counts, and puts a paid sale at the top of the to-do list', () => {
    render(<OverviewPage />, { initialState: initialState() });

    expect(screen.getByText('OverviewPage.greeting')).toBeInTheDocument();
    expect(screen.getByText('OverviewPage.todoTitle')).toBeInTheDocument();
    // The paid sale asks the seller to send it, with a deadline
    expect(screen.getByText('OverviewPage.action.send.title')).toBeInTheDocument();
    expect(screen.getAllByText('Scotty Cameron putter').length).toBeGreaterThan(0);
    expect(screen.getByText('OverviewPage.timeLeft.days')).toBeInTheDocument();
    // Recent trades show it as a sale that is still to be sent
    expect(screen.getByText('OverviewPage.tradeStatus.toSend')).toBeInTheDocument();
  });

  it('lists the missing setup as a to-do, not "all done", for a seller not set up', () => {
    render(<OverviewPage />, { initialState: initialState({ saleRefs: [] }) });

    expect(screen.queryByText('OverviewPage.allDoneTitle')).not.toBeInTheDocument();
    expect(screen.getByText('OverviewPage.readyCount')).toBeInTheDocument();
    expect(screen.getByText('OverviewPage.noTrades')).toBeInTheDocument();
  });

  it('says all is done when nothing waits for you and you are set up', () => {
    const readyUser = {
      ...createCurrentUser('me', {
        emailVerified: true,
        profile: {
          firstName: 'Petra',
          lastName: 'M',
          displayName: 'Petra M',
          abbreviatedName: 'PM',
          protectedData: {
            phoneNumber: '12345678',
            senderAddress: { name: 'Petra M', line1: 'Testvej 1', postalCode: '2100', city: 'Kbh' },
          },
        },
      }),
      stripeAccount: { id: new UUID('stripe-account') },
    };
    const state = initialState({ saleRefs: [] });
    render(<OverviewPage />, { initialState: { ...state, user: { currentUser: readyUser } } });

    expect(screen.getByText('OverviewPage.allDoneTitle')).toBeInTheDocument();
    expect(screen.queryByText('OverviewPage.readyCount')).not.toBeInTheDocument();
  });
});
