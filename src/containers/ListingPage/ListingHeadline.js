import React from 'react';
import classNames from 'classnames';

import { FormattedMessage, useIntl } from '../../util/reactIntl';
import { formatMoney } from '../../util/currency';
import { userDisplayNameAsString } from '../../util/data';

import { AvatarMedium } from '../../components';

import css from './ListingHeadline.module.css';

// The label of an enum value from the listing field configuration, e.g.
// condition 'god' → 'God'. Unknown fields or values give nothing.
const enumLabel = (listingFields, key, value) => {
  if (!value) {
    return null;
  }
  const field = (listingFields || []).find(f => f.key === key);
  const option = field?.enumOptions?.find(o => `${o.option}` === `${value}`);
  return option?.label || null;
};

/**
 * FAIRWAY: the top of a listing — what it is, what it costs and who sells it.
 *
 * Tags for the things a golfer decides on at a glance (condition, flex, how
 * it arrives), the title and the price, and — on a phone, where the buy panel
 * only opens on "Køb nu" — the seller right below, with a way to write to them.
 *
 * @component
 * @param {Object} props
 * @param {string} [props.className]
 * @param {'page'|'panel'} [props.variant] - 'page' on phones above the fold, 'panel' in the desktop buy panel
 * @param {string} props.title - The listing title
 * @param {Object} [props.price] - The listing price (Money)
 * @param {Object} props.publicData - The listing's public data
 * @param {Array} props.listingFields - Listing field configuration, for enum labels
 * @param {Object} [props.author] - The seller (for the phone variant)
 * @param {Function} [props.onContactUser] - Opens the message form (phone variant)
 * @param {boolean} [props.isOwnListing]
 * @returns {JSX.Element}
 */
const ListingHeadline = props => {
  const {
    className,
    variant = 'page',
    title,
    price,
    publicData = {},
    listingFields,
    author,
    onContactUser,
    isOwnListing,
  } = props;
  const intl = useIntl();

  const condition = enumLabel(listingFields, 'condition', publicData.condition);
  const flex = enumLabel(listingFields, 'shaft_flex', publicData.shaft_flex);
  const shipmentType = ['own', 'box', 'meetup'].includes(publicData.shipment_type)
    ? publicData.shipment_type
    : null;

  const authorName = userDisplayNameAsString(author, '');
  const authorCreatedAt = author?.attributes?.createdAt;
  const Heading = variant === 'page' ? 'h1' : 'h2';

  return (
    <div className={classNames(css.root, css[variant], className)}>
      {condition || flex || shipmentType ? (
        <ul className={css.tags}>
          {condition ? (
            <li className={classNames(css.tag, css.tagCondition)}>
              <FormattedMessage id="ListingHeadline.condition" values={{ condition }} />
            </li>
          ) : null}
          {flex ? <li className={css.tag}>{flex}</li> : null}
          {shipmentType ? (
            <li className={css.tag}>
              <FormattedMessage id={`ListingHeadline.shipment.${shipmentType}`} />
            </li>
          ) : null}
        </ul>
      ) : null}

      <Heading className={css.title}>{title}</Heading>

      {price ? (
        <p className={css.priceRow}>
          <span className={css.price}>{formatMoney(intl, price)}</span>
          <span className={css.priceNote}>
            <FormattedMessage
              id={
                shipmentType === 'meetup'
                  ? 'ListingHeadline.priceNotePickup'
                  : 'ListingHeadline.priceNote'
              }
            />
          </span>
        </p>
      ) : null}

      {variant === 'page' && author?.id ? (
        <div className={css.seller}>
          <AvatarMedium user={author} className={css.avatar} />
          <div className={css.sellerText}>
            <span className={css.sellerName}>{authorName}</span>
            {authorCreatedAt ? (
              <span className={css.sellerMeta}>
                <FormattedMessage
                  id="OrderPanel.memberSince"
                  values={{
                    date: intl.formatDate(new Date(authorCreatedAt), {
                      year: 'numeric',
                      month: 'short',
                    }),
                  }}
                />
              </span>
            ) : null}
          </div>
          {!isOwnListing && typeof onContactUser === 'function' ? (
            <button type="button" className={css.contact} onClick={onContactUser}>
              <FormattedMessage id="ProductOrderForm.contactSeller" />
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
};

export default ListingHeadline;
