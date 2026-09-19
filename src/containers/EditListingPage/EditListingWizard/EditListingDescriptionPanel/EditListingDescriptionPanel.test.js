import React from 'react';
import '@testing-library/jest-dom';

import { renderWithProviders as render, testingLibrary } from '../../../../util/testHelpers';
import { createOwnListing } from '../../../../util/testData';

import EditListingDescriptionPanel from './EditListingDescriptionPanel';

const { screen, userEvent, waitFor } = testingLibrary;

const noop = () => null;
const UpdatePageTitle = () => null;

// FAIRWAY: description was lifted out of the details step onto a step of its
// own, so the details step no longer asks for it. It stays optional.
describe('EditListingDescriptionPanel', () => {
  const panelProps = (listing, overrides = {}) => ({
    listing,
    disabled: false,
    ready: false,
    onSubmit: noop,
    submitButtonText: 'Save description',
    panelUpdated: false,
    updateInProgress: false,
    errors: {},
    updatePageTitle: UpdatePageTitle,
    ...overrides,
  });

  const listingWith = description =>
    createOwnListing('listing-item', {
      title: 'the listing',
      description,
      publicData: {
        listingType: 'sell-bicycles',
        transactionProcessAlias: 'default-purchase/release-1',
        unitType: 'item',
      },
    });

  it('asks for the description on this step', () => {
    render(<EditListingDescriptionPanel {...panelProps(listingWith(''))} />);

    expect(
      screen.getByRole('textbox', { name: /EditListingDescriptionPanel/i })
    ).toBeInTheDocument();
    expect(screen.getByText('EditListingDescriptionPanel.hint')).toBeInTheDocument();
  });

  it('shows the text already stored on the listing', () => {
    render(<EditListingDescriptionPanel {...panelProps(listingWith('Lorem ipsum'))} />);

    expect(screen.getByRole('textbox', { name: /EditListingDescriptionPanel/i })).toHaveValue(
      'Lorem ipsum'
    );
  });

  it('lets the seller move on without writing anything', async () => {
    const user = userEvent.setup();
    const onSubmit = jest.fn();
    render(<EditListingDescriptionPanel {...panelProps(listingWith(''), { onSubmit })} />);

    // The step is optional and says so, rather than blocking the seller.
    expect(screen.getByText('EditListingDescriptionPanel.optional')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Save description' }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith({ description: '' }));
  });

  it('submits what the seller typed', async () => {
    const user = userEvent.setup();
    const onSubmit = jest.fn();
    render(<EditListingDescriptionPanel {...panelProps(listingWith(''), { onSubmit })} />);

    await user.type(
      screen.getByRole('textbox', { name: /EditListingDescriptionPanel/i }),
      'Nearly new, one season'
    );
    await user.click(screen.getByRole('button', { name: 'Save description' }));

    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith({ description: 'Nearly new, one season' })
    );
  });
});
