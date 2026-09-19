import React from 'react';
import classNames from 'classnames';
import { Form as FinalForm } from 'react-final-form';

import { FormattedMessage, useIntl } from '../../../../util/reactIntl';
import { LISTING_STATE_DRAFT } from '../../../../util/types';
import { required } from '../../../../util/validators';

import { Button, FieldRadioButton, Form, H3, ListingLink } from '../../../../components';

import css from './EditListingShippingPanel.module.css';

/**
 * How the seller wants to ship. Saved as publicData.shipment_type, which is what
 * the box-and-label automation reads.
 *
 * There is deliberately no preselected option: a listing must not reach the
 * review step with a shipping choice nobody made.
 *
 * Both routes ship, so the listing is always marked as shipped for the purchase
 * process. Collection is not offered in this version.
 */
const OPTIONS = [
  {
    value: 'box',
    labelId: 'EditListingShippingPanel.optionBox',
    hintId: 'EditListingShippingPanel.optionBoxHint',
  },
  {
    value: 'own',
    labelId: 'EditListingShippingPanel.optionOwn',
    hintId: 'EditListingShippingPanel.optionOwnHint',
  },
];

// The seller pays nothing for the box or the label; the buyer pays a flat 50 kr
// freight on top of the price. Collection is not offered, so pickup stays off.
export const FREIGHT_SUBUNITS = 5000;

const deliveryValues = {
  pickupEnabled: false,
  shippingEnabled: true,
  shippingPriceInSubunitsOneItem: FREIGHT_SUBUNITS,
  // One parcel, one rate: extra items of the same listing add no freight.
  // This has to be written explicitly — the line-item calculation rejects a
  // multi-item order whose additional-items price was never set.
  shippingPriceInSubunitsAdditionalItems: 0,
};

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
  const classes = classNames(rootClassName || css.root, className);
  const isPublished = listing?.id && listing?.attributes?.state !== LISTING_STATE_DRAFT;
  const publicData = listing?.attributes?.publicData || {};

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

      <FinalForm
        initialValues={{ shipment_type: publicData.shipment_type }}
        onSubmit={values => {
          const shipmentType = values.shipment_type;
          onSubmit({
            publicData: {
              shipment_type: shipmentType,
              ...deliveryValues,
            },
          });
        }}
        render={formRenderProps => {
          const { handleSubmit, invalid, pristine, values } = formRenderProps;
          const { updateListingError, showListingsError } = errors || {};
          const submitReady = (panelUpdated && pristine) || ready;
          const submitInProgress = updateInProgress;
          const submitDisabled = invalid || disabled || submitInProgress;

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

              <div className={css.options}>
                {OPTIONS.map(option => (
                  <div
                    key={option.value}
                    className={
                      values.shipment_type === option.value
                        ? classNames(css.option, css.optionSelected)
                        : css.option
                    }
                  >
                    <FieldRadioButton
                      id={`shipment_type_${option.value}`}
                      name="shipment_type"
                      value={option.value}
                      label={intl.formatMessage({ id: option.labelId })}
                      validate={required(
                        intl.formatMessage({ id: 'EditListingShippingPanel.required' })
                      )}
                    />
                    <p className={css.optionHint}>
                      <FormattedMessage id={option.hintId} />
                    </p>
                  </div>
                ))}
              </div>

              {!values.shipment_type ? (
                <p className={css.requiredNote}>
                  <FormattedMessage id="EditListingShippingPanel.required" />
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
