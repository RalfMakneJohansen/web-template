import React from 'react';
import classNames from 'classnames';

import { FormattedMessage } from '../../../util/reactIntl';

import css from './TransactionPanel.module.css';

/**
 * Which note applies to a purchase waiting to reach the buyer.
 *
 * @param {Object} params
 * @param {string} params.deliveryMethod 'shipping' | 'pickup'
 * @param {string} params.shipmentType the listing's 'own' | 'box' | 'meetup'
 * @param {Object} params.metadata transaction metadata written by the freight automation
 * @returns {string|null} 'meetup' | 'boxOnItsWay' | 'boxComing' | 'own' | null
 */
export const progressStepFor = ({ deliveryMethod, shipmentType, metadata }) => {
  if (deliveryMethod === 'pickup') {
    return 'meetup';
  }
  if (deliveryMethod !== 'shipping') {
    return null;
  }
  if (shipmentType === 'box') {
    const boxStatus = metadata?.boxShipment?.status;
    const boxSent = metadata?.boxDispatchedAt || (boxStatus && boxStatus !== 'label_created');
    return boxSent ? 'boxOnItsWay' : 'boxComing';
  }
  return 'own';
};

/**
 * FAIRWAY: what happens next, while a purchase is on its way.
 *
 * Between payment and delivery the template shows nothing but a status line.
 * For a Fairway box there is an extra leg — the box has to reach the seller
 * first — and for a pickup the next step is a conversation, not a parcel. This
 * says, to each side, what is happening and what they should do.
 *
 * Box progress comes from the transaction's metadata, written by the freight
 * automation (docs/shipping-data.md): boxShipment, or the older boxDispatchedAt.
 * The tracking numbers themselves are in ShipmentTrackingMaybe, for both sides.
 *
 * @component
 * @param {Object} props
 * @param {string} [props.className] - Custom class that extends the default class for the root element
 * @param {string} props.processState - The transaction's current state in the process
 * @param {boolean} props.isCustomer - Whether the current user is the buyer
 * @param {string} props.deliveryMethod - 'shipping' | 'pickup'
 * @param {string} [props.shipmentType] - The listing's shipment_type
 * @param {Object} [props.metadata] - The transaction's metadata
 * @returns {JSX.Element|null} the note, or nothing outside purchased and delivered
 */
const OrderProgressMaybe = props => {
  const { className, processState, isCustomer, deliveryMethod, shipmentType, metadata } = props;
  // After the seller marks it shipped or delivered, the 48 hours are what
  // matter: the buyer's window to check the item, and when the seller is paid.
  const step =
    processState === 'delivered'
      ? 'inspection'
      : processState === 'purchased'
      ? progressStepFor({ deliveryMethod, shipmentType, metadata })
      : null;
  if (!step) {
    return null;
  }
  const role = isCustomer ? 'customer' : 'provider';

  return (
    <div className={classNames(css.orderProgress, className)} role="status">
      <p className={css.orderProgressTitle}>
        <FormattedMessage id={`OrderProgress.${step}.${role}.title`} />
      </p>
      <p className={css.orderProgressText}>
        <FormattedMessage id={`OrderProgress.${step}.${role}.text`} />
      </p>
    </div>
  );
};

export default OrderProgressMaybe;
