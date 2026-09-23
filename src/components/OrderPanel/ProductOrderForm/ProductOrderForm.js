import React, { useEffect, useState } from 'react';
import { Form as FinalForm, FormSpy } from 'react-final-form';

import { EVENTS, track } from '../../../analytics/track';
import { FormattedMessage, useIntl } from '../../../util/reactIntl';
import { propTypes } from '../../../util/types';
import { numberAtLeast, required } from '../../../util/validators';

import {
  Form,
  FieldSelect,
  FieldTextInput,
  InlineTextButton,
  PrimaryButton,
  SecondaryButton,
} from '../../../components';

import FairwayPriceBreakdown from '../FairwayPriceBreakdown/FairwayPriceBreakdown';
import ShareListingButton from '../ShareListingButton/ShareListingButton';

import FetchLineItemsError from '../FetchLineItemsError/FetchLineItemsError.js';

import css from './ProductOrderForm.module.css';

// Browsers can't render huge number of select options.
// (stock is shown inside select element)
// Note: input element could allow ordering bigger quantities
const MAX_QUANTITY_FOR_DROPDOWN = 100;

const strokeIcon = path => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 20 20"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {path}
  </svg>
);

/**
 * FAIRWAY: three reasons to press the button, each with a line icon rather than
 * a tick — a column of ticks reads as a pricing table, not as a guarantee.
 */
const GUARANTEES = [
  {
    id: 'ProductOrderForm.guaranteeEscrow',
    icon: strokeIcon(
      <>
        <path d="M10 2.5 3.75 5v4.4c0 3.6 2.5 6.7 6.25 8.1 3.75-1.4 6.25-4.5 6.25-8.1V5L10 2.5Z" />
        <path d="m7.5 9.9 1.9 1.9 3.6-3.6" />
      </>
    ),
  },
  {
    id: 'ProductOrderForm.guaranteeShipping',
    icon: strokeIcon(
      <>
        <path d="M1.9 5.6h9.4v8.1H1.9z" />
        <path d="M11.3 8.1h3.1l2.5 2.5v3.1h-5.6z" />
        <circle cx="5.3" cy="15" r="1.6" />
        <circle cx="14.1" cy="15" r="1.6" />
      </>
    ),
  },
  {
    id: 'ProductOrderForm.guaranteeInspection',
    icon: strokeIcon(
      <>
        <circle cx="10" cy="10" r="7.5" />
        <path d="M10 5.6V10l2.8 1.9" />
      </>
    ),
  },
];

const handleFetchLineItems = ({
  quantity,
  deliveryMethod,
  displayDeliveryMethod,
  listingId,
  isOwnListing,
  fetchLineItemsInProgress,
  onFetchTransactionLineItems,
}) => {
  const stockReservationQuantity = Number.parseInt(quantity, 10);
  const deliveryMethodMaybe = deliveryMethod ? { deliveryMethod } : {};
  const isBrowser = typeof window !== 'undefined';
  if (
    isBrowser &&
    stockReservationQuantity &&
    (!displayDeliveryMethod || deliveryMethod) &&
    !fetchLineItemsInProgress
  ) {
    onFetchTransactionLineItems({
      orderData: { stockReservationQuantity, ...deliveryMethodMaybe },
      listingId,
      isOwnListing,
    });
  }
};

const DeliveryMethodMaybe = props => {
  const { displayDeliveryMethod, hasMultipleDeliveryMethods, hasStock, formId, intl } = props;
  const showDeliveryMethodSelector = displayDeliveryMethod && hasMultipleDeliveryMethods;
  // FAIRWAY: when there is only one delivery method there is nothing to choose,
  // and the breakdown below already names the freight. The value still travels
  // with the form as a hidden field — only the label is gone.
  return !hasStock ? null : showDeliveryMethodSelector ? (
    <FieldSelect
      id={`${formId}.deliveryMethod`}
      className={css.deliveryField}
      name="deliveryMethod"
      label={intl.formatMessage({ id: 'ProductOrderForm.deliveryMethodLabel' })}
      validate={required(intl.formatMessage({ id: 'ProductOrderForm.deliveryMethodRequired' }))}
    >
      <option disabled value="">
        {intl.formatMessage({ id: 'ProductOrderForm.selectDeliveryMethodOption' })}
      </option>
      <option value={'pickup'}>
        {intl.formatMessage({ id: 'ProductOrderForm.pickupOption' })}
      </option>
      <option value={'shipping'}>
        {intl.formatMessage({ id: 'ProductOrderForm.shippingOption' })}
      </option>
    </FieldSelect>
  ) : (
    <FieldTextInput
      id={`${formId}.deliveryMethod`}
      className={css.deliveryField}
      name="deliveryMethod"
      type="hidden"
    />
  );
};

const renderForm = formRenderProps => {
  const [mounted, setMounted] = useState(false);
  const {
    // FormRenderProps from final-form
    handleSubmit,
    form: formApi,

    // Custom props passed to the form component
    intl,
    formId,
    currentStock,
    allowOrdersOfMultipleItems,
    hasMultipleDeliveryMethods,
    displayDeliveryMethod,
    listingId,
    isOwnListing,
    onFetchTransactionLineItems,
    onContactUser,
    onMakeOffer,
    lineItems,
    fetchLineItemsInProgress,
    fetchLineItemsError,
    price,
    payoutDetailsWarning,
    listingTitle,
    values,
    sectionHeadingAs = 'h3',
  } = formRenderProps;

  // Note: don't add custom logic before useEffect
  useEffect(() => {
    setMounted(true);

    // Side-effect: fetch line-items after mounting if possible
    const { quantity, deliveryMethod } = values;
    if (quantity && !formRenderProps.hasMultipleDeliveryMethods) {
      handleFetchLineItems({
        quantity,
        deliveryMethod,
        displayDeliveryMethod,
        listingId,
        isOwnListing,
        fetchLineItemsInProgress,
        onFetchTransactionLineItems,
      });
    }
  }, []);

  // If form values change, update line-items for the order breakdown
  const handleOnChange = formValues => {
    const { quantity, deliveryMethod } = formValues.values;
    if (mounted) {
      handleFetchLineItems({
        quantity,
        deliveryMethod,
        listingId,
        isOwnListing,
        fetchLineItemsInProgress,
        onFetchTransactionLineItems,
      });
    }
  };

  // In case quantity and deliveryMethod are missing focus on that select-input.
  // Otherwise continue with the default handleSubmit function.
  const handleFormSubmit = e => {
    const { quantity, deliveryMethod } = values || {};
    if (!quantity || quantity < 1) {
      e.preventDefault();
      // Blur event will show validator message
      formApi.blur('quantity');
      formApi.focus('quantity');
    } else if (displayDeliveryMethod && !deliveryMethod) {
      e.preventDefault();
      // Blur event will show validator message
      formApi.blur('deliveryMethod');
      formApi.focus('deliveryMethod');
    } else {
      handleSubmit(e);
    }
  };

  const showBreakdown = lineItems && !fetchLineItemsInProgress && !fetchLineItemsError;

  const showContactUser = typeof onContactUser === 'function';
  const showMakeOffer = typeof onMakeOffer === 'function';

  const onClickBuy = () => {
    track(EVENTS.BUY_CLICKED, { listing_id: listingId?.uuid });
  };

  const onClickContactUser = e => {
    e.preventDefault();
    onContactUser();
  };

  const onClickMakeOffer = e => {
    e.preventDefault();
    onMakeOffer();
  };

  const contactSellerLink = (
    <InlineTextButton onClick={onClickContactUser}>
      <FormattedMessage id="ProductOrderForm.finePrintNoStockLinkText" />
    </InlineTextButton>
  );
  const quantityRequiredMsg = intl.formatMessage({ id: 'ProductOrderForm.quantityRequired' });

  // Listing is out of stock if currentStock is zero.
  // Undefined/null stock means that stock has never been set.
  const hasNoStockLeft = typeof currentStock != null && currentStock === 0;
  const hasStock = currentStock && currentStock > 0;
  const hasOneItemLeft = currentStock === 1;
  const selectableStock =
    currentStock > MAX_QUANTITY_FOR_DROPDOWN ? MAX_QUANTITY_FOR_DROPDOWN : currentStock;
  const quantities = hasStock ? [...Array(selectableStock).keys()].map(i => i + 1) : [];

  const submitInProgress = fetchLineItemsInProgress;
  // FAIRWAY: you cannot buy your own listing, so the button does not offer it.
  //
  // The panel already hides "Giv bud" and "Skriv til sælger" on your own
  // annonce — you cannot bid against yourself or message yourself — but it
  // left "Køb nu" standing as a full-width primary button. So the card hid
  // the two actions you cannot take and kept the third one you cannot take
  // either, which is what made the same annonce look different depending on
  // who opened it. The fine print under the button already says it is your
  // own listing; now the button agrees with it.
  const submitDisabled = !hasStock || isOwnListing;

  return (
    <Form onSubmit={handleFormSubmit}>
      <FormSpy subscription={{ values: true }} onChange={handleOnChange} />
      {hasNoStockLeft ? null : hasOneItemLeft || !allowOrdersOfMultipleItems ? (
        <FieldTextInput
          id={`${formId}.quantity`}
          className={css.quantityField}
          name="quantity"
          type="hidden"
          validate={numberAtLeast(quantityRequiredMsg, 1)}
        />
      ) : (
        <FieldSelect
          id={`${formId}.quantity`}
          className={css.quantityField}
          name="quantity"
          disabled={!hasStock}
          label={intl.formatMessage({ id: 'ProductOrderForm.quantityLabel' })}
          validate={numberAtLeast(quantityRequiredMsg, 1)}
        >
          <option disabled value="">
            {intl.formatMessage({ id: 'ProductOrderForm.selectQuantityOption' })}
          </option>
          {quantities.map(quantity => (
            <option key={quantity} value={quantity}>
              {intl.formatMessage({ id: 'ProductOrderForm.quantityOption' }, { quantity })}
            </option>
          ))}
        </FieldSelect>
      )}

      <DeliveryMethodMaybe
        displayDeliveryMethod={displayDeliveryMethod}
        hasMultipleDeliveryMethods={hasMultipleDeliveryMethods}
        deliveryMethod={values?.deliveryMethod}
        hasStock={hasStock}
        formId={formId}
        intl={intl}
      />

      {/* FAIRWAY: the total before the button, not after it. A buyer who only
          learns about freight on the checkout page is a buyer who leaves. */}
      {showBreakdown ? (
        <FairwayPriceBreakdown lineItems={lineItems} currency={price.currency} />
      ) : null}

      <FetchLineItemsError error={fetchLineItemsError} />

      <div className={css.submitButton}>
        {/* FAIRWAY: buy and bid as a pair, asking underneath.
            On a used marketplace most sales start with an offer, so bidding
            belongs beside buying rather than under it as one of two equal
            secondaries. Asking a question is the quieter thing and keeps its
            own full-width row. */}
        <div className={css.buyRow}>
          <PrimaryButton
            type="submit"
            inProgress={submitInProgress}
            disabled={submitDisabled}
            onClick={onClickBuy}
          >
            {hasStock ? (
              <FormattedMessage id="ProductOrderForm.ctaButton" />
            ) : (
              <FormattedMessage id="ProductOrderForm.ctaButtonNoStock" />
            )}
          </PrimaryButton>

          {!isOwnListing && showMakeOffer ? (
            <SecondaryButton type="button" className={css.bidButton} onClick={onClickMakeOffer}>
              <FormattedMessage id="ProductOrderForm.makeOffer" />
            </SecondaryButton>
          ) : null}
        </div>

        {!isOwnListing && showContactUser ? (
          <div className={css.askRow}>
            <SecondaryButton type="button" className={css.askButton} onClick={onClickContactUser}>
              <FormattedMessage id="ProductOrderForm.contactSeller" />
            </SecondaryButton>
          </div>
        ) : null}

        <div className={css.shareRow}>
          <ShareListingButton listingId={listingId} title={listingTitle} />
        </div>
      </div>

      {/* FAIRWAY: what the buyer is covered by, stated where they decide */}
      <ul className={css.guarantees}>
        {GUARANTEES.map(g => (
          <li key={g.id} className={css.guarantee}>
            <span className={css.guaranteeIcon} aria-hidden={true}>
              {g.icon}
            </span>
            <FormattedMessage id={g.id} />
          </li>
        ))}
      </ul>

      <p className={css.finePrint}>
        {payoutDetailsWarning ? (
          payoutDetailsWarning
        ) : hasStock && isOwnListing ? (
          <FormattedMessage id="ProductOrderForm.ownListing" />
        ) : hasStock ? (
          <FormattedMessage id="ProductOrderForm.finePrint" />
        ) : showContactUser ? (
          <FormattedMessage id="ProductOrderForm.finePrintNoStock" values={{ contactSellerLink }} />
        ) : null}
      </p>
    </Form>
  );
};

/**
 * A form for ordering a product.
 *
 * @component
 * @param {Object} props
 * @param {string} [props.rootClassName] - Custom class that overrides the default class for the root element
 * @param {string} [props.className] - Custom class that extends the default class for the root element
 * @param {string} props.marketplaceName - The name of the marketplace
 * @param {string} props.formId - The ID of the form
 * @param {Function} props.onSubmit - The function to handle the form submission
 * @param {propTypes.uuid} props.listingId - The ID of the listing
 * @param {propTypes.money} props.price - The price of the listing
 * @param {number} props.currentStock - The current stock of the listing
 * @param {boolean} props.isOwnListing - Whether the listing is owned by the current user
 * @param {boolean} props.pickupEnabled - Whether pickup is enabled
 * @param {boolean} props.shippingEnabled - Whether shipping is enabled
 * @param {boolean} props.displayDeliveryMethod - Whether the delivery method is displayed
 * @param {Object} props.lineItems - The line items
 * @param {Function} props.onFetchTransactionLineItems - The function to fetch the transaction line items
 * @param {boolean} props.fetchLineItemsInProgress - Whether the line items are being fetched
 * @param {propTypes.error} props.fetchLineItemsError - The error for fetching the line items
 * @param {Function} props.onContactUser - The function to contact the user
 * @param {'h2'|'h3'} [props.sectionHeadingAs='h3'] - Semantic heading level for form section titles
 * @returns {JSX.Element}
 */
const ProductOrderForm = props => {
  const intl = useIntl();
  const {
    price,
    currentStock,
    pickupEnabled,
    shippingEnabled,
    displayDeliveryMethod,
    allowOrdersOfMultipleItems,
  } = props;

  // Should not happen for listings that go through EditListingWizard.
  // However, this might happen for imported listings.
  if (displayDeliveryMethod && !pickupEnabled && !shippingEnabled) {
    return (
      <p className={css.error}>
        <FormattedMessage id="ProductOrderForm.noDeliveryMethodSet" />
      </p>
    );
  }

  const hasOneItemLeft = currentStock && currentStock === 1;
  const hasOneItemMode = !allowOrdersOfMultipleItems && currentStock > 0;
  const quantityMaybe = hasOneItemLeft || hasOneItemMode ? { quantity: '1' } : {};
  const deliveryMethodMaybe =
    shippingEnabled && !pickupEnabled
      ? { deliveryMethod: 'shipping' }
      : !shippingEnabled && pickupEnabled
      ? { deliveryMethod: 'pickup' }
      : !shippingEnabled && !pickupEnabled
      ? { deliveryMethod: 'none' }
      : {};
  const hasMultipleDeliveryMethods = pickupEnabled && shippingEnabled;
  const initialValues = { ...quantityMaybe, ...deliveryMethodMaybe };

  return (
    <FinalForm
      initialValues={initialValues}
      hasMultipleDeliveryMethods={hasMultipleDeliveryMethods}
      displayDeliveryMethod={displayDeliveryMethod}
      {...props}
      intl={intl}
      render={renderForm}
    />
  );
};

export default ProductOrderForm;
