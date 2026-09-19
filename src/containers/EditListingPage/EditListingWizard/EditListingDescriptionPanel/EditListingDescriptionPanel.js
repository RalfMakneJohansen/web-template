import React from 'react';
import classNames from 'classnames';
import { Form as FinalForm } from 'react-final-form';

import { FormattedMessage, useIntl } from '../../../../util/reactIntl';
import { LISTING_STATE_DRAFT } from '../../../../util/types';

import { Button, FieldTextInput, Form, H3, ListingLink } from '../../../../components';

import css from './EditListingDescriptionPanel.module.css';

/**
 * Description gets its own step so the seller writes it after seeing their own
 * photos — by then they know what is worth mentioning.
 *
 * The field is optional in this version: the hard requirements before publishing
 * are category, brand, condition, price, three photos and a shipping choice.
 */
const EditListingDescriptionPanel = props => {
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

  const panelHeadingProps = isPublished
    ? {
        id: 'EditListingDescriptionPanel.title',
        values: { listingTitle: <ListingLink listing={listing} />, lineBreak: <br /> },
        messageProps: { listingTitle: listing.attributes.title },
      }
    : {
        id: 'EditListingDescriptionPanel.createListingTitle',
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
        initialValues={{ description: listing?.attributes?.description }}
        onSubmit={values => onSubmit({ description: values.description || '' })}
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
                  <FormattedMessage id="EditListingDescriptionPanel.updateFailed" />
                </p>
              ) : null}
              {showListingsError ? (
                <p className={css.error}>
                  <FormattedMessage id="EditListingDescriptionPanel.showListingFailed" />
                </p>
              ) : null}

              <p className={css.hint}>
                <FormattedMessage id="EditListingDescriptionPanel.hint" />
              </p>

              <FieldTextInput
                id="description"
                name="description"
                className={css.description}
                type="textarea"
                label={intl.formatMessage({ id: 'EditListingDescriptionPanel.label' })}
                placeholder={intl.formatMessage({
                  id: 'EditListingDescriptionPanel.placeholder',
                })}
              />

              <Button
                className={css.submitButton}
                type="submit"
                inProgress={submitInProgress}
                disabled={submitDisabled}
                ready={submitReady}
              >
                {submitButtonText}
              </Button>

              {!values.description ? (
                <p className={css.optionalNote}>
                  <FormattedMessage id="EditListingDescriptionPanel.optional" />
                </p>
              ) : null}
            </Form>
          );
        }}
      />
    </main>
  );
};

export default EditListingDescriptionPanel;
