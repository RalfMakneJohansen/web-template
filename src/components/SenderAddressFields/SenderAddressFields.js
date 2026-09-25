import React from 'react';
import classNames from 'classnames';

import { FormattedMessage, useIntl } from '../../util/reactIntl';
import { composeValidators, required } from '../../util/validators';
import { DANISH_PHONE, DANISH_POSTCODE, matches } from '../../util/fairwayContact';

import FieldTextInput from '../FieldTextInput/FieldTextInput';

import css from './SenderAddressFields.module.css';

/**
 * FAIRWAY: where a seller's parcel ships from.
 *
 * The fields a freight label needs from the sender: full name, street address,
 * postcode, town and a mobile number the carrier can text. Used inside a React
 * Final Form on the listing's shipping step and on the trading guide page, and
 * stored on the seller's profile with senderProfileUpdate (util/fairwayContact).
 *
 * @component
 * @param {Object} props
 * @param {string} [props.className] - Custom class that extends the default class for the root element
 * @param {string} [props.rootClassName] - Custom class that overrides the default class for the root element
 * @param {string} [props.idPrefix] - Prefix for the input ids, when more than one form is on a page
 * @returns {JSX.Element} the sender address fields
 */
const SenderAddressFields = props => {
  const { className, rootClassName, idPrefix = 'sender' } = props;
  const intl = useIntl();
  const msg = id => intl.formatMessage({ id: `SenderAddressFields.${id}` });
  const classes = classNames(rootClassName || css.root, className);

  return (
    <div className={classes}>
      <FieldTextInput
        id={`${idPrefix}Name`}
        name="senderName"
        type="text"
        autoComplete="name"
        label={msg('name')}
        validate={required(msg('nameRequired'))}
      />
      <FieldTextInput
        id={`${idPrefix}Line1`}
        name="senderLine1"
        type="text"
        autoComplete="address-line1"
        label={msg('line1')}
        placeholder={msg('line1Placeholder')}
        validate={required(msg('line1Required'))}
      />
      <div className={css.row}>
        <FieldTextInput
          id={`${idPrefix}Postal`}
          name="senderPostal"
          type="text"
          inputMode="numeric"
          autoComplete="postal-code"
          label={msg('postal')}
          placeholder="2100"
          validate={composeValidators(
            required(msg('postalRequired')),
            matches(DANISH_POSTCODE, msg('postalInvalid'))
          )}
        />
        <FieldTextInput
          id={`${idPrefix}City`}
          name="senderCity"
          type="text"
          autoComplete="address-level2"
          label={msg('city')}
          placeholder="København Ø"
          validate={required(msg('cityRequired'))}
        />
      </div>
      <FieldTextInput
        id={`${idPrefix}Phone`}
        name="senderPhone"
        type="tel"
        inputMode="tel"
        autoComplete="tel"
        label={msg('phone')}
        placeholder="12 34 56 78"
        validate={composeValidators(
          required(msg('phoneRequired')),
          matches(DANISH_PHONE, msg('phoneInvalid'))
        )}
      />
      <p className={css.privacy}>
        <FormattedMessage id="SenderAddressFields.privacy" />
      </p>
    </div>
  );
};

export default SenderAddressFields;
