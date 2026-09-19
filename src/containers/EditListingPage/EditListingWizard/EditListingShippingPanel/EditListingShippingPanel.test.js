import React from 'react';
import '@testing-library/jest-dom';

import { renderWithProviders as render, testingLibrary } from '../../../../util/testHelpers';
import { createOwnListing } from '../../../../util/testData';

import EditListingShippingPanel from './EditListingShippingPanel';

const { screen, userEvent, waitFor } = testingLibrary;

const noop = () => null;
const UpdatePageTitle = () => null;

// FAIRWAY: the shipping step is the only place a seller answers shipment_type,
// and the payload it submits is what the box-and-label automation and the
// line-item calculation both read. These tests pin that payload.
describe('EditListingShippingPanel', () => {
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
    render(<EditListingShippingPanel {...panelProps(publishedListing())} />);

    await user.click(screen.getByRole('radio', { name: 'EditListingShippingPanel.optionBox' }));

    expect(screen.getByRole('radio', { name: 'EditListingShippingPanel.optionBox' })).toBeChecked();
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Save shipping' })).not.toBeDisabled();
    });
  });

  it('submits the shipment type together with the derived delivery values', async () => {
    const user = userEvent.setup();
    const onSubmit = jest.fn();
    render(<EditListingShippingPanel {...panelProps(publishedListing(), { onSubmit })} />);

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
