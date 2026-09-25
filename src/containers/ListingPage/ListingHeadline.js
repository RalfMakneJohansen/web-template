import React from 'react';
import classNames from 'classnames';

import { FormattedMessage, useIntl } from '../../util/reactIntl';
import { formatMoney } from '../../util/currency';
import { userDisplayNameAsString } from '../../util/data';
import { saleBreakdown } from '../../util/fairwayFees';
import { types as sdkTypes } from '../../util/sdkLoader';

import { AvatarMedium, NamedLink } from '../../components';

import SaveListingButton from './SaveListingButton';
import css from './ListingHeadline.module.css';

const { Money } = sdkTypes;

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

const StarIcon = () => (
  <svg className={css.star} width="14" height="14" viewBox="0 0 20 20" aria-hidden={true}>
    <path d="m10 1.8 2.5 5.3 5.8.7-4.3 4 1.1 5.7L10 14.7l-5.1 2.8L6 11.8l-4.3-4 5.8-.7L10 1.8Z" />
  </svg>
);

/**
 * FAIRWAY: the top of a listing — what it is, what it costs and who sells it.
 *
 * Tags for the things a golfer decides on at a glance (condition, flex, how
 * it arrives) with a heart to save it, the title, the price and — worked out
 * with the same rates the server charges (util/fairwayFees.js) — the total
 * with freight and buyer protection. On a phone, where the buy panel only
 * opens on "Køb nu", the seller follows with their rating and a way to write.
 *
 * @component
 * @param {Object} props
 * @param {string} [props.className]
 * @param {'page'|'panel'} [props.variant] - 'page' on phones above the fold, 'panel' in the desktop buy panel
 * @param {string} [props.listingId] - The listing uuid, for "Gem"
 * @param {string} props.title - The listing title
 * @param {Object} [props.price] - The listing price (Money)
 * @param {Object} props.publicData - The listing's public data
 * @param {Array} props.listingFields - Listing field configuration, for enum labels
 * @param {Object} [props.author] - The seller (for the phone variant)
 * @param {{ average: number|null, count: number }} [props.sellerRating]
 * @param {Function} [props.onContactUser] - Opens the message form (phone variant)
 * @param {boolean} [props.isOwnListing]
 * @returns {JSX.Element}
 */
const ListingHeadline = props => {
  const {
    className,
    variant = 'page',
    listingId,
    title,
    price,
    publicData = {},
    listingFields,
    author,
    sellerRating,
    onContactUser,
    isOwnListing,
  } = props;
  const intl = useIntl();

  const condition = enumLabel(listingFields, 'condition', publicData.condition);
  const flex = enumLabel(listingFields, 'shaft_flex', publicData.shaft_flex);
  const shipmentType = ['own', 'box', 'meetup'].includes(publicData.shipment_type)
    ? publicData.shipment_type
    : null;

  // What the buyer pays in all, from the same rates the server uses.
  const total =
    price?.currency === 'DKK'
      ? new Money(saleBreakdown(price.amount, shipmentType || 'own').buyerTotal, 'DKK')
      : null;

  const authorName = userDisplayNameAsString(author, '');
  const authorCreatedAt = author?.attributes?.createdAt;
  const Heading = variant === 'page' ? 'h1' : 'h2';
  const hasRating = sellerRating?.count > 0 && sellerRating.average;

  return (
    <div className={classNames(css.root, css[variant], className)}>
      <div className={css.topRow}>
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
        ) : (
          <span />
        )}
        {!isOwnListing ? <SaveListingButton listingId={listingId} compact /> : null}
      </div>

      <Heading className={css.title}>{title}</Heading>

      {price ? (
        <div className={css.priceBlock}>
          <span className={css.price}>{formatMoney(intl, price)}</span>
          <span className={css.priceNote}>
            {total ? (
              <FormattedMessage
                id={
                  shipmentType === 'meetup'
                    ? 'ListingHeadline.totalPickup'
                    : 'ListingHeadline.totalShipped'
                }
                values={{
                  total: <strong className={css.totalAmount}>{formatMoney(intl, total)}</strong>,
                }}
              />
            ) : (
              <FormattedMessage id="ListingHeadline.priceNote" />
            )}{' '}
            <NamedLink name="CMSPage" params={{ pageId: 'tryghed' }} className={css.readMore}>
              <FormattedMessage id="ListingHeadline.readMore" />
            </NamedLink>
          </span>
        </div>
      ) : null}

      {variant === 'page' && author?.id ? (
        <div className={css.seller}>
          <AvatarMedium user={author} className={css.avatar} />
          <div className={css.sellerText}>
            <span className={css.sellerName}>{authorName}</span>
            <span className={css.sellerMeta}>
              {hasRating ? (
                <span className={css.rating}>
                  <StarIcon />
                  <FormattedMessage
                    id="ListingHeadline.rating"
                    values={{
                      average: intl.formatNumber(sellerRating.average, {
                        minimumFractionDigits: 1,
                        maximumFractionDigits: 1,
                      }),
                      count: sellerRating.count,
                    }}
                  />
                </span>
              ) : null}
              {authorCreatedAt ? (
                <FormattedMessage
                  id="OrderPanel.memberSince"
                  values={{
                    date: intl.formatDate(new Date(authorCreatedAt), {
                      year: 'numeric',
                      month: 'short',
                    }),
                  }}
                />
              ) : null}
            </span>
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
