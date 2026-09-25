import React from 'react';
import '@testing-library/jest-dom';

import { renderWithProviders as render, testingLibrary } from '../../../../util/testHelpers';
import { createCurrentUser, createOwnListing } from '../../../../util/testData';
import { updateProfile } from '../../../ProfileSettingsPage/ProfileSettingsPage.duck';

import { normalisePhone } from '../../../../util/fairwayContact';
import EditListingShippingPanel from './EditListingShippingPanel';

// The sender address is saved on the seller's profile through this thunk.
// Stubbed so the tests do not need an SDK; each test sees the call it caused.
jest.mock('../../../ProfileSettingsPage/ProfileSettingsPage.duck', () => ({
  updateProfile: jest.fn(),
}));

const { screen, userEvent, waitFor } = testingLibrary;

const noop = () => null;
const UpdatePageTitle = () => null;

// FAIRWAY: the shipping step is the only place a seller answers shipment_type,
// and the payload it submits is what the box-and-label automation and the
// line-item calculation both read. These tests pin that payload.
// A seller who has shipped before: the sender address is on their profile
const sellerWithSender = createCurrentUser('seller', {
  profile: {
    firstName: 'Mette',
    lastName: 'Jensen',
    displayName: 'Mette J',
    abbreviatedName: 'MJ',
    protectedData: {
      phoneNumber: '+45 12 34 56 78',
      senderAddress: {
        name: 'Mette Jensen',
        line1: 'Vejnavn 12',
        postalCode: '2100',
        city: 'København Ø',
        country: 'DK',
      },
    },
  },
});
const withSender = { initialState: { user: { currentUser: sellerWithSender } } };

describe('EditListingShippingPanel', () => {
  // The project resets mock implementations between tests, so set it each time
  beforeEach(() => {
    updateProfile.mockImplementation(() => () => Promise.resolve({ payload: {} }));
  });

  const panelProps = (listing, overrides = {}) => ({
    listing,
    disabled: false,
    ready: false,
    onSubmit: noop,
    submitButtonText: 'Save shipping',
    panelUpdated: false,
    updateInProgress: false,
    errors: {},
    updatePageTitle: UpdatePageTitle,
    ...overrides,
  });

  const publishedListing = publicData =>
    createOwnListing('listing-item', {
      title: 'the listing',
      publicData: {
        listingType: 'sell-bicycles',
        transactionProcessAlias: 'default-purchase/release-1',
        unitType: 'item',
        ...publicData,
      },
    });

  it('offers both shipment options with neither preselected', () => {
    render(<EditListingShippingPanel {...panelProps(publishedListing())} />);

    const box = screen.getByRole('radio', { name: 'EditListingShippingPanel.optionBox' });
    const own = screen.getByRole('radio', { name: 'EditListingShippingPanel.optionOwn' });

    expect(box).not.toBeChecked();
    expect(own).not.toBeChecked();

    // A listing must not reach the review step with a choice nobody made.
    expect(screen.getByRole('button', { name: 'Save shipping' })).toBeDisabled();
  });

  it('does not offer collection, which this version deliberately leaves out', () => {
    render(<EditListingShippingPanel {...panelProps(publishedListing())} />);

    expect(
      screen.queryByRole('radio', { name: 'EditListingShippingPanel.optionPickup' })
    ).not.toBeInTheDocument();
  });

  it('enables submit once a shipment type is picked', async () => {
    const user = userEvent.setup();
    render(<EditListingShippingPanel {...panelProps(publishedListing())} />, withSender);

    await user.click(screen.getByRole('radio', { name: 'EditListingShippingPanel.optionBox' }));

    expect(screen.getByRole('radio', { name: 'EditListingShippingPanel.optionBox' })).toBeChecked();
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Save shipping' })).not.toBeDisabled();
    });
  });

  it('submits the shipment type together with the derived delivery values', async () => {
    const user = userEvent.setup();
    const onSubmit = jest.fn();
    render(
      <EditListingShippingPanel {...panelProps(publishedListing(), { onSubmit })} />,
      withSender
    );

    await user.click(screen.getByRole('radio', { name: 'EditListingShippingPanel.optionOwn' }));
    await user.click(screen.getByRole('button', { name: 'Save shipping' }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));

    // Both routes ship, so pickup stays off and shipping on for every listing,
    // and the buyer pays the flat freight regardless of which route was picked.
    expect(onSubmit).toHaveBeenCalledWith({
      publicData: {
        shipment_type: 'own',
        pickupEnabled: false,
        shippingEnabled: true,
        shippingPriceInSubunitsOneItem: 5000,
        shippingPriceInSubunitsAdditionalItems: 0,
      },
    });

    // The sender address is stored on the profile before the listing moves on
    expect(updateProfile).toHaveBeenCalledWith({
      protectedData: {
        senderAddress: {
          name: 'Mette Jensen',
          line1: 'Vejnavn 12',
          postalCode: '2100',
          city: 'København Ø',
          country: 'DK',
        },
        phoneNumber: '+45 12 34 56 78',
      },
    });
  });

  it('asks a first-time seller for a sender address before moving on', async () => {
    const user = userEvent.setup();
    const onSubmit = jest.fn();
    render(<EditListingShippingPanel {...panelProps(publishedListing(), { onSubmit })} />);

    await user.click(screen.getByRole('radio', { name: 'EditListingShippingPanel.optionBox' }));

    // Shipping chosen, but no address yet: the step cannot be finished
    expect(screen.getByRole('button', { name: 'Save shipping' })).toBeDisabled();

    await user.type(screen.getByLabelText('SenderAddressFields.name'), 'Ole Hansen');
    await user.type(screen.getByLabelText('SenderAddressFields.line1'), 'Gade 3');
    await user.type(screen.getByLabelText('SenderAddressFields.postal'), '8000');
    await user.type(screen.getByLabelText('SenderAddressFields.city'), 'Aarhus C');
    await user.type(screen.getByLabelText('SenderAddressFields.phone'), '87654321');

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Save shipping' })).not.toBeDisabled();
    });
    await user.click(screen.getByRole('button', { name: 'Save shipping' }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(updateProfile).toHaveBeenCalledWith({
      protectedData: {
        senderAddress: {
          name: 'Ole Hansen',
          line1: 'Gade 3',
          postalCode: '8000',
          city: 'Aarhus C',
          country: 'DK',
        },
        phoneNumber: '+45 87 65 43 21',
      },
    });
  });

  it('writes every accepted phone format the same way', () => {
    expect(normalisePhone('12345678')).toBe('+45 12 34 56 78');
    expect(normalisePhone('12 34 56 78')).toBe('+45 12 34 56 78');
    expect(normalisePhone('+4512345678')).toBe('+45 12 34 56 78');
    expect(normalisePhone('45 12 34 56 78')).toBe('+45 12 34 56 78');
  });

  it('preselects the choice already stored on the listing', () => {
    render(
      <EditListingShippingPanel {...panelProps(publishedListing({ shipment_type: 'box' }))} />
    );

    expect(screen.getByRole('radio', { name: 'EditListingShippingPanel.optionBox' })).toBeChecked();
    expect(
      screen.getByRole('radio', { name: 'EditListingShippingPanel.optionOwn' })
    ).not.toBeChecked();
  });

  it('surfaces a failed save', () => {
    render(
      <EditListingShippingPanel
        {...panelProps(publishedListing(), { errors: { updateListingError: new Error('nope') } })}
      />
    );

    expect(screen.getByText('EditListingShippingPanel.updateFailed')).toBeInTheDocument();
  });
});
