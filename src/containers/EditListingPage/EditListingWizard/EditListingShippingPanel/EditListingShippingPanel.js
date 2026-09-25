import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import classNames from 'classnames';
import { Form as FinalForm } from 'react-final-form';

import { useConfiguration } from '../../../../context/configurationContext';

import { FormattedMessage, useIntl } from '../../../../util/reactIntl';
import { displayDeliveryPickup } from '../../../../util/configHelpers';
import { LISTING_STATE_DRAFT } from '../../../../util/types';
import { required } from '../../../../util/validators';
import { senderInitialValues, senderProfileUpdate } from '../../../../util/fairwayContact';
import { FREIGHT_SUBUNITS as FREIGHT, isShipped } from '../../../../util/fairwayFees';

import {
  Button,
  FieldRadioButton,
  Form,
  H3,
  ListingLink,
  SaleBreakdown,
  SenderAddressFields,
} from '../../../../components';

import { updateProfile } from '../../../ProfileSettingsPage/ProfileSettingsPage.duck';

import css from './EditListingShippingPanel.module.css';

const BoxIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden={true}>
    <path d="M3.5 7.5 12 3l8.5 4.5v9L12 21l-8.5-4.5z" />
    <path d="M3.5 7.5 12 12l8.5-4.5M12 12v9" />
  </svg>
);

const TruckIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden={true}>
    <path d="M2.5 6.5h11v9h-11zM13.5 9.5h4l3 3v3h-7z" />
    <circle cx="6.5" cy="17.5" r="1.8" />
    <circle cx="17" cy="17.5" r="1.8" />
  </svg>
);

const HandshakeIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden={true}>
    <path d="m2.5 11.5 4-4 3 1.5 3-2 4 1 5 4" />
    <path d="m6.5 13.5 3 3a1.4 1.4 0 0 0 2-2m-1 1 2 2a1.4 1.4 0 0 0 2-2l-1-1m0 0 1 1a1.4 1.4 0 0 0 2-2l-3-3" />
    <path d="M2.5 11.5 5 14M21.5 12.5l-3 3" />
  </svg>
);

const CheckIcon = () => (
  <svg viewBox="0 0 16 16" aria-hidden={true}>
    <path d="m4 8.5 2.5 2.5L12 5.5" />
  </svg>
);

/**
 * How the parcel reaches the buyer. Saved as publicData.shipment_type, which
 * the box-and-label automation reads, and shown to buyers as a delivery box on
 * the listing page.
 *
 * - own: the seller packs in their own box; we send a label. Fastest.
 * - box: we send the seller a box and a label first, so delivery takes longer.
 * - meetup: handed over in person. Still paid through Fairway, so the buyer
 *   keeps their protection; the money is released when they confirm pickup.
 *
 * The seller pays nothing for any of them. There is deliberately no
 * preselected option: the choice decides what arrives at the seller's door,
 * so it has to be made, not inherited.
 */
const OPTIONS = [
  { value: 'own', icon: BoxIcon },
  { value: 'box', icon: TruckIcon, warning: true },
  { value: 'meetup', icon: HandshakeIcon },
];

// Kept for the tests and anything that imports it from here
export const FREIGHT_SUBUNITS = FREIGHT;

// The purchase process reads deliveryOptions from these. Shipped listings
// carry the flat freight; a meetup listing is pickup only and ships nothing.
export const deliveryValuesFor = shipmentType =>
  isShipped(shipmentType)
    ? {
        pickupEnabled: false,
        shippingEnabled: true,
        shippingPriceInSubunitsOneItem: FREIGHT,
        // One parcel, one rate: extra items of the same listing add no freight.
        // This has to be written explicitly — the line-item calculation rejects
        // a multi-item order whose additional-items price was never set.
        shippingPriceInSubunitsAdditionalItems: 0,
      }
    : {
        pickupEnabled: true,
        shippingEnabled: false,
        shippingPriceInSubunitsOneItem: 0,
        shippingPriceInSubunitsAdditionalItems: 0,
      };

// FAIRWAY: where the parcel is collected from.
//
// A freight label needs a sender: name, street address, postcode, town and a
// phone number the carrier can text. It is asked for here, on the step that is
// about shipping, and saved on the seller's own profile (protectedData, which
// only the seller and our backend can read) — one address for all of their
// listings, filled in once and prefilled after that. A meetup ships nothing,
// so it is not asked for then.
//
// The fields and the profile update are shared with the trading guide page
// (SenderAddressFields, util/fairwayContact).

const EditListingShippingPanel = props => {
  const {
    className,
    rootClassName,
    listing,
    disabled,
    ready,
    onSubmit,
    submitButtonText,
    panelUpdated,
    updateInProgress,
    errors,
    updatePageTitle: UpdatePageTitle,
  } = props;

  const intl = useIntl();
  const dispatch = useDispatch();
  const currentUser = useSelector(state => state.user?.currentUser);
  const [senderSaveFailed, setSenderSaveFailed] = useState(false);
  const [senderSaveInProgress, setSenderSaveInProgress] = useState(false);
  const classes = classNames(rootClassName || css.root, className);
  const isPublished = listing?.id && listing?.attributes?.state !== LISTING_STATE_DRAFT;
  const publicData = listing?.attributes?.publicData || {};
  const priceSubunits = listing?.attributes?.price?.amount;

  // A meetup is the purchase process's pickup, which the buyer can only choose
  // if pickup is enabled on the listing type in Console. Until it is, the
  // option is not offered — a pickup-only listing would leave the buyer with
  // no delivery method at checkout. A listing already saved as a meetup keeps
  // the option so it can be changed.
  const config = useConfiguration();
  const listingTypeConfig = config?.listing?.listingTypes?.find(
    t => t.listingType === publicData.listingType
  );
  const meetupAvailable =
    displayDeliveryPickup(listingTypeConfig) || publicData.shipment_type === 'meetup';
  const options = OPTIONS.filter(o => o.value !== 'meetup' || meetupAvailable);

  const panelHeadingProps = isPublished
    ? {
        id: 'EditListingShippingPanel.title',
        values: { listingTitle: <ListingLink listing={listing} />, lineBreak: <br /> },
        messageProps: { listingTitle: listing.attributes.title },
      }
    : {
        id: 'EditListingShippingPanel.createListingTitle',
        values: { lineBreak: <br /> },
        messageProps: {},
      };

  const handleSubmit = values => {
    const shipmentType = values.shipment_type;
    const saveListing = () =>
      onSubmit({
        publicData: {
          shipment_type: shipmentType,
          ...deliveryValuesFor(shipmentType),
        },
      });

    // A meetup sends no parcel, so there is no sender address to store
    if (!isShipped(shipmentType)) {
      return saveListing();
    }

    // The sender goes on the seller's profile first; the listing step only
    // moves on once the address is safely stored.
    setSenderSaveFailed(false);
    setSenderSaveInProgress(true);
    return Promise.resolve(dispatch(updateProfile(senderProfileUpdate(values))))
      .then(result => {
        setSenderSaveInProgress(false);
        if (result?.error) {
          setSenderSaveFailed(true);
          return;
        }
        saveListing();
      })
      .catch(() => {
        setSenderSaveInProgress(false);
        setSenderSaveFailed(true);
      });
  };

  return (
    <main className={classes}>
      <UpdatePageTitle
        panelHeading={intl.formatMessage(
          { id: panelHeadingProps.id },
          { ...panelHeadingProps.messageProps }
        )}
      />
      <H3 as="h1">
        <FormattedMessage id={panelHeadingProps.id} values={{ ...panelHeadingProps.values }} />
      </H3>
      <p className={css.lead}>
        <FormattedMessage id="EditListingShippingPanel.lead" />
      </p>

      <FinalForm
        initialValues={{
          shipment_type: publicData.shipment_type,
          ...senderInitialValues(currentUser),
        }}
        onSubmit={handleSubmit}
        render={formRenderProps => {
          const { handleSubmit, invalid, pristine, values, submitFailed } = formRenderProps;
          const { updateListingError, showListingsError } = errors || {};
          const submitReady = (panelUpdated && pristine) || ready;
          const submitInProgress = updateInProgress || senderSaveInProgress;
          const submitDisabled = invalid || disabled || submitInProgress;
          const selected = values.shipment_type;

          return (
            <Form className={css.form} onSubmit={handleSubmit}>
              {updateListingError ? (
                <p className={css.error}>
                  <FormattedMessage id="EditListingShippingPanel.updateFailed" />
                </p>
              ) : null}
              {showListingsError ? (
                <p className={css.error}>
                  <FormattedMessage id="EditListingShippingPanel.showListingFailed" />
                </p>
              ) : null}

              <div
                className={css.options}
                role="radiogroup"
                aria-label={intl.formatMessage({ id: 'EditListingShippingPanel.createListingTitle' })}
              >
                {options.map(option => {
                  const isSelected = selected === option.value;
                  const Icon = option.icon;
                  const key = `EditListingShippingPanel.option.${option.value}`;
                  return (
                    <div
                      key={option.value}
                      className={isSelected ? classNames(css.option, css.optionSelected) : css.option}
                    >
                      <span className={css.optionIcon}>
                        <Icon />
                      </span>
                      <span className={css.optionCheck} aria-hidden={true}>
                        <CheckIcon />
                      </span>
                      <FieldRadioButton
                        className={css.optionRadio}
                        id={`shipment_type_${option.value}`}
                        name="shipment_type"
                        value={option.value}
                        label={intl.formatMessage({ id: `${key}.title` })}
                        validate={required(
                          intl.formatMessage({ id: 'EditListingShippingPanel.required' })
                        )}
                      />
                      <dl className={css.facts}>
                        <div className={css.fact}>
                          <dt>
                            <FormattedMessage id="EditListingShippingPanel.factSellerCost" />
                          </dt>
                          <dd>
                            <FormattedMessage id={`${key}.sellerCost`} />
                          </dd>
                        </div>
                        <div className={css.fact}>
                          <dt>
                            <FormattedMessage id="EditListingShippingPanel.factDelivery" />
                          </dt>
                          <dd>
                            <FormattedMessage id={`${key}.delivery`} />
                          </dd>
                        </div>
                      </dl>
                      <p className={css.optionHint}>
                        <FormattedMessage id={`${key}.hint`} />
                      </p>
                      {option.warning && isSelected ? (
                        <p className={css.optionWarning}>
                          <FormattedMessage id={`${key}.warning`} />
                        </p>
                      ) : null}
                    </div>
                  );
                })}
              </div>

              {/* Only after the seller has tried to move on. It used to appear
                  the moment the step loaded, so they were told off for not
                  answering a question they had only just been asked. */}
              {submitFailed && !selected ? (
                <p className={css.requiredNote}>
                  <FormattedMessage id="EditListingShippingPanel.required" />
                </p>
              ) : null}

              {selected ? (
                <SaleBreakdown
                  className={css.breakdown}
                  priceSubunits={priceSubunits}
                  shipmentType={selected}
                />
              ) : null}

              {selected && isShipped(selected) ? (
                <section className={css.sender}>
                  <h2 className={css.senderTitle}>
                    <FormattedMessage id="EditListingShippingPanel.senderTitle" />
                  </h2>
                  <p className={css.senderHint}>
                    <FormattedMessage id="EditListingShippingPanel.senderHint" />
                  </p>
                  <SenderAddressFields idPrefix="sender" />
                </section>
              ) : null}

              {selected === 'meetup' ? (
                <p className={css.meetupNote}>
                  <FormattedMessage id="EditListingShippingPanel.meetupNote" />
                </p>
              ) : null}

              {senderSaveFailed ? (
                <p className={css.error}>
                  <FormattedMessage id="EditListingShippingPanel.senderSaveFailed" />
                </p>
              ) : null}

              <Button
                className={css.submitButton}
                type="submit"
                inProgress={submitInProgress}
                disabled={submitDisabled}
                ready={submitReady}
              >
                {submitButtonText}
              </Button>
            </Form>
          );
        }}
      />
    </main>
  );
};

export default EditListingShippingPanel;
