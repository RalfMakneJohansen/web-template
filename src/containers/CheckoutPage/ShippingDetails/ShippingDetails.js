import React from 'react';
import classNames from 'classnames';

import { FormattedMessage, intlShape } from '../../../util/reactIntl';
import * as validators from '../../../util/validators';
import { DANISH_PHONE, DANISH_POSTCODE, matches } from '../../../util/fairwayContact';

import { FieldSelect, FieldTextInput, Heading } from '../../../components';

import css from './ShippingDetails.module.css';

/**
 * A component that displays the shipping details form on the checkout page.
 *
 * @component
 * @param {Object} props
 * @param {string} props.rootClassName - The root class name for the shipping details
 * @param {string} props.className - The class name for the shipping details
 * @param {string} props.locale - The locale
 * @param {intlShape} props.intl - The intl object
 * @param {boolean} props.disabled - Whether the form is disabled
 * @param {Object} props.formApi - The form API from React Final Form
 * @param {string} props.fieldId - The field ID
 */
const ShippingDetails = props => {
  const { rootClassName, className, locale, intl, disabled, formApi, fieldId } = props;
  const classes = classNames(rootClassName || css.root, className);

  const optionalText = intl.formatMessage({
    id: 'ShippingDetails.optionalText',
  });

  // FAIRWAY: we ship inside Denmark only, at one flat rate. The country is
  // fixed, the US-style "state" line is gone, and the phone number is required
  // because the carrier texts the recipient about the parcel.

  return (
    <div className={classes}>
      <Heading as="h3" rootClassName={css.heading}>
        <FormattedMessage id="ShippingDetails.title" />
      </Heading>
      <FieldTextInput
        id={`${fieldId}.recipientName`}
        name="recipientName"
        disabled={disabled}
        className={css.fieldFullWidth}
        type="text"
        autoComplete="shipping name"
        label={intl.formatMessage({ id: 'ShippingDetails.recipientNameLabel' })}
        placeholder={intl.formatMessage({
          id: 'ShippingDetails.recipientNamePlaceholder',
        })}
        validate={validators.required(
          intl.formatMessage({ id: 'ShippingDetails.recipientNameRequired' })
        )}
        onUnmount={() => formApi.change('recipientName', undefined)}
      />
      <FieldTextInput
        id={`${fieldId}.recipientPhoneNumber`}
        name="recipientPhoneNumber"
        disabled={disabled}
        className={css.fieldFullWidth}
        type="tel"
        inputMode="tel"
        autoComplete="shipping tel"
        label={intl.formatMessage({ id: 'ShippingDetails.recipientMobileLabel' })}
        placeholder="12 34 56 78"
        validate={validators.composeValidators(
          validators.required(intl.formatMessage({ id: 'ShippingDetails.recipientMobileRequired' })),
          matches(DANISH_PHONE, intl.formatMessage({ id: 'ShippingDetails.recipientMobileInvalid' }))
        )}
        onUnmount={() => formApi.change('recipientPhoneNumber', undefined)}
      />
      <div className={css.formRow}>
        <FieldTextInput
          id={`${fieldId}.recipientAddressLine1`}
          name="recipientAddressLine1"
          disabled={disabled}
          className={css.field}
          type="text"
          autoComplete="shipping address-line1"
          label={intl.formatMessage({ id: 'ShippingDetails.addressLine1Label' })}
          placeholder={intl.formatMessage({
            id: 'ShippingDetails.addressLine1Placeholder',
          })}
          validate={validators.required(
            intl.formatMessage({ id: 'ShippingDetails.addressLine1Required' })
          )}
          onUnmount={() => formApi.change('recipientAddressLine1', undefined)}
        />

        <FieldTextInput
          id={`${fieldId}.recipientAddressLine2`}
          name="recipientAddressLine2"
          disabled={disabled}
          className={css.field}
          type="text"
          autoComplete="shipping address-line2"
          label={intl.formatMessage(
            { id: 'ShippingDetails.addressLine2Label' },
            { optionalText: optionalText }
          )}
          placeholder={intl.formatMessage({
            id: 'ShippingDetails.addressLine2Placeholder',
          })}
          onUnmount={() => formApi.change('recipientAddressLine2', undefined)}
        />
      </div>
      <div className={css.formRow}>
        <FieldTextInput
          id={`${fieldId}.recipientPostalCode`}
          name="recipientPostal"
          disabled={disabled}
          className={css.field}
          type="text"
          inputMode="numeric"
          autoComplete="shipping postal-code"
          label={intl.formatMessage({ id: 'ShippingDetails.postalCodeLabel' })}
          placeholder={intl.formatMessage({
            id: 'ShippingDetails.postalCodePlaceholder',
          })}
          validate={validators.composeValidators(
            validators.required(intl.formatMessage({ id: 'ShippingDetails.postalCodeRequired' })),
            matches(DANISH_POSTCODE, intl.formatMessage({ id: 'ShippingDetails.postalCodeInvalid' }))
          )}
          onUnmount={() => formApi.change('recipientPostal', undefined)}
        />

        <FieldTextInput
          id={`${fieldId}.recipientCity`}
          name="recipientCity"
          disabled={disabled}
          className={css.field}
          type="text"
          autoComplete="shipping address-level2"
          label={intl.formatMessage({ id: 'ShippingDetails.cityLabel' })}
          placeholder={intl.formatMessage({ id: 'ShippingDetails.cityPlaceholder' })}
          validate={validators.required(intl.formatMessage({ id: 'ShippingDetails.cityRequired' }))}
          onUnmount={() => formApi.change('recipientCity', undefined)}
        />
      </div>
      <FieldSelect
        id={`${fieldId}.recipientCountry`}
        name="recipientCountry"
        disabled={disabled}
        className={css.fieldFullWidth}
        label={intl.formatMessage({ id: 'ShippingDetails.countryLabel' })}
        defaultValue="DK"
        validate={validators.required(intl.formatMessage({ id: 'ShippingDetails.countryRequired' }))}
      >
        <option value="DK">Danmark</option>
      </FieldSelect>
    </div>
  );
};

export default ShippingDetails;
