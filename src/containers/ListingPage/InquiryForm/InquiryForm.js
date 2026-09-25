import React, { useState } from 'react';
import { Form as FinalForm, useForm } from 'react-final-form';
import classNames from 'classnames';

import appSettings from '../../../config/settings';
import { FormattedMessage, useIntl } from '../../../util/reactIntl';
import { formatMoney } from '../../../util/currency';
import { types as sdkTypes } from '../../../util/sdkLoader';
import * as validators from '../../../util/validators';

import {
  ErrorMessage,
  FieldCurrencyInput,
  FieldTextInput,
  Form,
  Heading,
  IconInquiry,
  OffPlatformWarning,
  PrimaryButton,
} from '../../../components';

import css from './InquiryForm.module.css';

const { Money } = sdkTypes;

/**
 * FAIRWAY: a bid is not a separate conversation, it is a first message with a
 * number in it. Until the negotiation process is switched on in Console, the
 * amount is composed into the inquiry message, so the seller sees a concrete
 * offer and can answer it in the thread that already exists.
 *
 * A bid far under the asking price is usually a slip of the keyboard, so it is
 * caught here rather than wasting the seller's time.
 */
const MIN_OFFER_RATIO = 0.25;

// FAIRWAY: one-tap bids a little under the asking price, rounded to the
// nearest 50 kr. the way people actually bid.
const QUICK_BID_DISCOUNTS = [5, 10, 15];
const ROUND_TO_SUBUNITS = 5000;

export const quickBids = priceSubunits =>
  priceSubunits > 0
    ? QUICK_BID_DISCOUNTS.map(percent => ({
        percent,
        amount: Math.max(
          ROUND_TO_SUBUNITS,
          Math.round((priceSubunits * (100 - percent)) / 100 / ROUND_TO_SUBUNITS) *
            ROUND_TO_SUBUNITS
        ),
      })).filter(
        (bid, i, all) =>
          bid.amount < priceSubunits && all.findIndex(b => b.amount === bid.amount) === i
      )
    : [];

const OfferFields = props => {
  const { formId, intl, listingPrice, marketplaceCurrency } = props;
  const form = useForm();
  // The currency input keeps its own text; a new key redraws it with a picked bid.
  const [amountKey, setAmountKey] = useState(0);

  const currency = listingPrice?.currency || marketplaceCurrency;
  const minOfferSubunits = listingPrice ? Math.round(listingPrice.amount * MIN_OFFER_RATIO) : 0;

  const amountRequired = validators.required(
    intl.formatMessage({ id: 'InquiryForm.offerAmountRequired' })
  );
  const amountTooLow = validators.moneySubUnitAmountAtLeast(
    intl.formatMessage(
      { id: 'InquiryForm.offerAmountTooLow' },
      { minPrice: formatMoney(intl, new Money(minOfferSubunits, currency)) }
    ),
    minOfferSubunits
  );

  return (
    <>
      <FieldCurrencyInput
        key={amountKey}
        id={formId ? `${formId}.offerAmount` : 'offerAmount'}
        name="offerAmount"
        className={css.field}
        label={intl.formatMessage({ id: 'InquiryForm.offerAmountLabel' })}
        placeholder={listingPrice ? formatMoney(intl, listingPrice) : ''}
        currencyConfig={appSettings.getCurrencyFormatting(currency)}
        validate={validators.composeValidators(amountRequired, amountTooLow)}
        // No autoFocus: the modal moves focus to itself right after opening, which
        // blurred the field and showed "Skriv hvad du vil byde" before anyone typed.
      />

      {listingPrice && currency === listingPrice.currency ? (
        <div
          className={css.quickBids}
          role="group"
          aria-label={intl.formatMessage({ id: 'InquiryForm.quickBidsLabel' })}
        >
          {quickBids(listingPrice.amount).map(bid => (
            <button
              key={bid.percent}
              type="button"
              className={css.quickBid}
              onClick={() => {
                form.change('offerAmount', new Money(bid.amount, currency));
                setAmountKey(k => k + 1);
              }}
            >
              <span className={css.quickBidAmount}>
                {formatMoney(intl, new Money(bid.amount, currency))}
              </span>
              <span className={css.quickBidPercent}>−{bid.percent} %</span>
            </button>
          ))}
        </div>
      ) : null}

      {listingPrice ? (
        <p className={css.askingPrice}>
          <FormattedMessage
            id="InquiryForm.offerAskingPrice"
            values={{ price: formatMoney(intl, listingPrice) }}
          />
        </p>
      ) : null}

      <FieldTextInput
        className={css.field}
        type="textarea"
        name="message"
        id={formId ? `${formId}.message` : 'message'}
        label={intl.formatMessage({ id: 'InquiryForm.offerMessageLabel' })}
        placeholder={intl.formatMessage({ id: 'InquiryForm.offerMessagePlaceholder' })}
      />
    </>
  );
};

/**
 * The InquiryForm component.
 * NOTE: this InquiryForm is only for booking & purchase processes
 * The default-inquiry process is handled differently
 *
 * @component
 * @param {Object} props
 * @param {string} [props.className] - Custom class that extends the default class for the root element
 * @param {string} [props.rootClassName] - Custom class that overrides the default class for the root element
 * @param {string} [props.submitButtonWrapperClassName] - Custom class to be passed for the submit button wrapper
 * @param {boolean} [props.inProgress] - Whether the inquiry is in progress
 * @param {boolean} [props.isOffer] - Whether the form collects a bid instead of a plain message
 * @param {Object} [props.listingPrice] - The asking price (Money), shown next to the bid field
 * @param {string} [props.marketplaceCurrency] - Fallback currency for the bid field
 * @param {string} props.listingTitle - The listing title
 * @param {string} props.authorDisplayName - The author display name
 * @param {propTypes.error} props.sendInquiryError - The send inquiry error
 * @returns {JSX.Element} inquiry form component
 */
const InquiryForm = props => {
  const intl = useIntl();
  const { onSubmit, isOffer = false, listingTitle, ...rest } = props;

  // The transaction carries a message, not a bid field — so the bid is written
  // into the message the seller reads.
  const composeAndSubmit = values => {
    if (!isOffer) {
      return onSubmit(values);
    }
    const amount = values.offerAmount ? formatMoney(intl, values.offerAmount) : '';
    const opening = intl.formatMessage(
      { id: 'InquiryForm.offerComposed' },
      { amount, listingTitle }
    );
    const note = values.message ? values.message.trim() : '';
    return onSubmit({ ...values, message: note ? `${opening}\n\n${note}` : opening });
  };

  return (
    <FinalForm
      {...rest}
      isOffer={isOffer}
      listingTitle={listingTitle}
      onSubmit={composeAndSubmit}
      render={fieldRenderProps => {
        const {
          rootClassName,
          className,
          submitButtonWrapperClassName,
          formId,
          handleSubmit,
          inProgress = false,
          authorDisplayName,
          sendInquiryError,
          listingPrice,
          marketplaceCurrency,
          values,
        } = fieldRenderProps;

        const messageLabel = intl.formatMessage(
          { id: 'InquiryForm.messageLabel' },
          { authorDisplayName }
        );
        const messagePlaceholder = intl.formatMessage(
          { id: 'InquiryForm.messagePlaceholder' },
          { authorDisplayName }
        );
        const messageRequired = validators.requiredAndNonEmptyString(
          intl.formatMessage({ id: 'InquiryForm.messageRequired' })
        );

        const classes = classNames(rootClassName || css.root, className);
        const submitInProgress = inProgress;

        return (
          <Form
            className={classes}
            onSubmit={handleSubmit}
            enforcePagePreloadFor="OrderDetailsPage"
          >
            <IconInquiry className={css.icon} />
            <Heading as="h2" rootClassName={css.heading}>
              <FormattedMessage
                id={isOffer ? 'InquiryForm.offerHeading' : 'InquiryForm.heading'}
                values={{ listingTitle }}
              />
            </Heading>

            {isOffer ? (
              <OfferFields
                formId={formId}
                intl={intl}
                listingPrice={listingPrice}
                marketplaceCurrency={marketplaceCurrency}
              />
            ) : (
              <FieldTextInput
                className={css.field}
                type="textarea"
                name="message"
                id={formId ? `${formId}.message` : 'message'}
                label={messageLabel}
                placeholder={messagePlaceholder}
                validate={messageRequired}
              />
            )}

            {/* FAIRWAY: the first message is where "pay me on MobilePay" starts */}
            <OffPlatformWarning className={css.safety} text={values?.message} showNote />

            <div className={submitButtonWrapperClassName}>
              <ErrorMessage error={sendInquiryError} />
              <PrimaryButton
                type="submit"
                inProgress={submitInProgress}
                disabled={submitInProgress}
              >
                <FormattedMessage
                  id={isOffer ? 'InquiryForm.offerSubmit' : 'InquiryForm.submitButtonText'}
                />
              </PrimaryButton>
              {isOffer ? (
                <p className={css.hint}>
                  <FormattedMessage id="InquiryForm.offerHint" />
                </p>
              ) : null}
            </div>
          </Form>
        );
      }}
    />
  );
};

export default InquiryForm;
