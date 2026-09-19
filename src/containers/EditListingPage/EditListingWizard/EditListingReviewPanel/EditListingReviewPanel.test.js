import React from 'react';
import '@testing-library/jest-dom';

import {
  renderWithProviders as render,
  testingLibrary,
  getDefaultConfiguration,
} from '../../../../util/testHelpers';
import { createOwnListing } from '../../../../util/testData';

import EditListingReviewPanel from './EditListingReviewPanel';

const { screen, userEvent, waitFor } = testingLibrary;

const noop = () => null;
const UpdatePageTitle = () => null;

// FAIRWAY: the review step is the last thing before publish. Its job is to stop
// an incomplete draft from going live and to name the field that is missing,
// rather than failing with "something is wrong". The category-specific
// requirements are read off the listing config, so the panel is given a
// Fairway-shaped one here instead of the template's bike fixture.
describe('EditListingReviewPanel', () => {
  const baseConfig = getDefaultConfiguration();
  const config = {
    ...baseConfig,
    listing: {
      ...baseConfig.listing,
      minListingImages: 3,
      listingFields: [
        {
          key: 'brand',
          scope: 'public',
          schemaType: 'text',
          saveConfig: { label: 'Mærke', isRequired: true },
        },
        {
          key: 'condition',
          scope: 'public',
          schemaType: 'enum',
          enumOptions: [{ option: 'good', label: 'God' }],
          saveConfig: { label: 'Stand', isRequired: true },
        },
        {
          key: 'shipment_type',
          scope: 'public',
          schemaType: 'enum',
          enumOptions: [
            { option: 'box', label: 'Gratis kasse' },
            { option: 'own', label: 'Egen kasse' },
          ],
          saveConfig: { label: 'Fragt', isRequired: true },
        },
        {
          // Required only for clubs, which is what makes it interesting here.
          key: 'dexterity',
          scope: 'public',
          schemaType: 'enum',
          categoryConfig: { limitToCategoryIds: true, categoryIds: ['driver'] },
          enumOptions: [
            { option: 'right', label: 'Højrehåndet' },
            { option: 'left', label: 'Venstrehåndet' },
          ],
          saveConfig: {
            label: 'Hånd',
            isRequired: true,
            requiredMessage: 'Vælg om køllen er højre- eller venstrehåndet.',
          },
        },
      ],
    },
  };

  const panelProps = (listing, overrides = {}) => ({
    listing,
    config,
    params: { id: listing.id.uuid, slug: 'slug', type: 'edit', tab: 'review' },
    disabled: false,
    ready: false,
    onSubmit: noop,
    submitButtonText: 'Publish listing',
    updateInProgress: false,
    errors: {},
    updatePageTitle: UpdatePageTitle,
    ...overrides,
  });

  // Three images is the published minimum.
  const threeImages = { images: [{ id: 'i1' }, { id: 'i2' }, { id: 'i3' }] };

  const completeListing = (publicData = {}) =>
    createOwnListing(
      'listing-item',
      {
        title: 'the listing',
        description: 'Lorem ipsum',
        publicData: {
          listingType: 'sell-bicycles',
          transactionProcessAlias: 'default-purchase/release-1',
          unitType: 'item',
          categoryLevel1: 'driver',
          brand: 'Ping',
          condition: 'good',
          shipment_type: 'box',
          dexterity: 'right',
          ...publicData,
        },
      },
      threeImages
    );

  it('lets a complete listing be published', async () => {
    const user = userEvent.setup();
    const onSubmit = jest.fn();
    render(<EditListingReviewPanel {...panelProps(completeListing(), { onSubmit })} />);

    const publish = screen.getByRole('button', { name: 'Publish listing' });
    expect(publish).not.toBeDisabled();
    expect(screen.queryByText('EditListingReviewPanel.missingTitle')).not.toBeInTheDocument();

    await user.click(publish);
    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith({}));
  });

  it('blocks publish and names the field when the shipping choice is missing', () => {
    // A draft edited out of order can reach this step without a shipment_type.
    render(
      <EditListingReviewPanel {...panelProps(completeListing({ shipment_type: undefined }))} />
    );

    expect(screen.getByRole('button', { name: 'Publish listing' })).toBeDisabled();
    expect(screen.getByText('EditListingReviewPanel.missingTitle')).toBeInTheDocument();
    expect(screen.getByText('EditListingReviewPanel.missing.shipment')).toBeInTheDocument();
  });

  it('blocks publish when the condition is missing', () => {
    render(<EditListingReviewPanel {...panelProps(completeListing({ condition: undefined }))} />);

    expect(screen.getByRole('button', { name: 'Publish listing' })).toBeDisabled();
    expect(screen.getByText('EditListingReviewPanel.missing.condition')).toBeInTheDocument();
  });

  it('blocks publish when the listing has too few photos', () => {
    const listing = createOwnListing(
      'listing-item',
      { title: 'the listing', publicData: completeListing().attributes.publicData },
      { images: [{ id: 'i1' }] }
    );
    render(<EditListingReviewPanel {...panelProps(listing)} />);

    expect(screen.getByRole('button', { name: 'Publish listing' })).toBeDisabled();
    expect(screen.getByText('EditListingReviewPanel.missing.images')).toBeInTheDocument();
  });

  it('blocks publish on a required field that only applies to this category', () => {
    // dexterity is required for clubs and read off the config, so a new
    // required field shows up here without touching the panel.
    render(<EditListingReviewPanel {...panelProps(completeListing({ dexterity: undefined }))} />);

    expect(screen.getByRole('button', { name: 'Publish listing' })).toBeDisabled();
    expect(screen.getByText('Vælg om køllen er højre- eller venstrehåndet.')).toBeInTheDocument();
  });

  it('surfaces a failed publish', () => {
    render(
      <EditListingReviewPanel
        {...panelProps(completeListing(), {
          errors: { publishListingError: new Error('nope') },
        })}
      />
    );

    expect(screen.getByText('EditListingReviewPanel.publishFailed')).toBeInTheDocument();
  });
});
