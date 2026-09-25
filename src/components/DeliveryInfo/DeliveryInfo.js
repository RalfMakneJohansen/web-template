import React from 'react';
import classNames from 'classnames';

import { FormattedMessage } from '../../util/reactIntl';

import css from './DeliveryInfo.module.css';

const TruckIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden={true}>
    <path d="M2.5 6.5h11v9h-11zM13.5 9.5h4l3 3v3h-7z" />
    <circle cx="6.5" cy="17.5" r="1.8" />
    <circle cx="17" cy="17.5" r="1.8" />
  </svg>
);

const BoxIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden={true}>
    <path d="M3.5 7.5 12 3l8.5 4.5v9L12 21l-8.5-4.5z" />
    <path d="M3.5 7.5 12 12l8.5-4.5M12 12v9" />
  </svg>
);

const PinIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden={true}>
    <path d="M12 21s-6.5-6.2-6.5-11a6.5 6.5 0 0 1 13 0c0 4.8-6.5 11-6.5 11z" />
    <circle cx="12" cy="10" r="2.3" />
  </svg>
);

const ICONS = { own: TruckIcon, box: BoxIcon, meetup: PinIcon };

/**
 * The listing's shipping choice as the buyer should read it. Listings from
 * before the choice existed ship like 'own'; a pickup-only listing is a meetup.
 *
 * @param {Object} publicData listing public data
 * @returns {'own'|'box'|'meetup'|null}
 */
export const deliveryTypeOf = publicData => {
  const { shipment_type, shippingEnabled, pickupEnabled } = publicData || {};
  if (['own', 'box', 'meetup'].includes(shipment_type)) {
    return shipment_type;
  }
  if (pickupEnabled && !shippingEnabled) {
    return 'meetup';
  }
  return shippingEnabled ? 'own' : null;
};

/**
 * FAIRWAY: how the item reaches the buyer, under the price on a listing.
 *
 * Delivery time is part of the decision to buy: a buyer choosing between two
 * drivers should see that one arrives in 2–3 working days and the other takes
 * 4–6 because a box has to reach the seller first, or that it is collected in
 * person. Read from publicData.shipment_type.
 *
 * @component
 * @param {Object} props
 * @param {string} [props.className] - Custom class that extends the default class for the root element
 * @param {Object} props.publicData - The listing's public data
 * @returns {JSX.Element|null} the delivery box, or nothing for listings that do not ship or meet
 */
const DeliveryInfo = props => {
  const { className, publicData } = props;
  const type = deliveryTypeOf(publicData);
  if (!type) {
    return null;
  }
  const Icon = ICONS[type];

  return (
    <div className={classNames(css.root, className)}>
      <span className={css.icon}>
        <Icon />
      </span>
      <span className={css.copy}>
        <span className={css.title}>
          <FormattedMessage id={`DeliveryInfo.${type}.title`} />
        </span>
        <span className={css.text}>
          <FormattedMessage id={`DeliveryInfo.${type}.text`} />
        </span>
      </span>
    </div>
  );
};

export default DeliveryInfo;
