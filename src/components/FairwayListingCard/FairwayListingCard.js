import React from 'react';
import classNames from 'classnames';

import { useConfiguration } from '../../context/configurationContext';
import { FormattedMessage, useIntl } from '../../util/reactIntl';
import { formatMoney } from '../../util/currency';
import { createSlug } from '../../util/urlHelpers';
import { lazyLoadWithDimensions } from '../../util/uiHelpers';

import { AspectRatioWrapper, NamedLink, ResponsiveImage } from '../../components';

import css from './FairwayListingCard.module.css';

const LazyImage = lazyLoadWithDimensions(ResponsiveImage, { loadAfterInitialRendering: 3000 });

export const CONDITION_LABELS = {
  'som-ny': 'Som ny',
  god: 'God',
  okay: 'Okay',
  slidt: 'Slidt',
};

/**
 * The deciding specs, in the title.
 *
 * A grey second line under the name reads as a caption and gets skipped. The
 * specs that actually decide a used-club purchase — flex, loft, length —
 * belong in the name itself, so one glance at a grid is enough to compare two
 * drivers without opening either.
 *
 * Ordered the way a golfer says it: flex before loft. Read off the listing
 * field config rather than hard-coded, so the labels stay correct when an
 * option is renamed and a field that does not apply to the category drops out.
 */
const SPEC_KEYS = ['shaft_flex', 'loft', 'wedge_loft', 'putter_length', 'shoe_size'];

const specParts = (publicData, listingFields) => {
  if (!publicData) {
    return [];
  }
  return SPEC_KEYS.map(key => {
    const raw = publicData[key];
    if (raw == null || raw === '') {
      return null;
    }
    const field = listingFields.find(f => f.key === key);
    const option = field?.enumOptions?.find(o => `${o.option}` === `${raw}`);
    return option?.label || raw;
  })
    .filter(Boolean)
    .slice(0, 2);
};

/**
 * Fairway's product card.
 *
 * Laid out so a row of them reads as one shelf: every tile is the same height,
 * the photo sits on a neutral ground (listing photos arrive on wooden floors
 * and on white, and a grid of mixed backgrounds is what makes a marketplace
 * look untidy), and the price sits on a shared baseline at the bottom.
 *
 * @param {Object} props
 * @param {Object} props.listing API entity: listing or ownListing
 * @param {string?} props.className
 * @param {string?} props.renderSizes for img/srcset
 */
const FairwayListingCard = props => {
  const config = useConfiguration();
  const intl = useIntl();
  const { className, listing, renderSizes } = props;

  const id = listing?.id?.uuid;
  const { title = '', price, publicData } = listing?.attributes || {};
  const { brand, model, condition, shipment_type: shipmentType } = publicData || {};
  const slug = createSlug(title);

  const { variantPrefix = 'listing-card' } = config.layout.listingImage;

  const firstImage = listing?.images?.[0] || null;
  const variants = firstImage
    ? Object.keys(firstImage.attributes?.variants || {}).filter(k => k.startsWith(variantPrefix))
    : [];

  const formattedPrice =
    price && price.currency === config.currency ? formatMoney(intl, price) : null;

  const conditionLabel = CONDITION_LABELS[condition];

  // The brand as the maker spells it, not as the seller typed it.
  //
  // Mærke is free text, so a grid filled up with "titleist", "ping" and
  // "Taylormade" — three spellings of two brands, and the row reads as
  // unfinished. The brand field carries the list of makes we offer as
  // suggestions, so a case-insensitive hit against that list gives the
  // canonical spelling. A make that is not on the list is left exactly as
  // it was written: we do not know better than the seller there, and
  // title-casing blindly would turn PING into Ping.
  const brandSuggestions =
    (config.listing.listingFields || []).find(f => f.key === 'brand')?.suggestions || [];
  const canonicalBrand =
    brandSuggestions.find(b => b.toLowerCase() === String(brand || '').trim().toLowerCase()) ||
    brand;
  const specs = specParts(publicData, config.listing.listingFields || []);

  // The title carries the whole name — the wizard composes it from brand and
  // model, so it reads "Titleist GT4 Driver" rather than just "GT4". Model is
  // the fallback for listings written before that.
  const name = title || model;

  return (
    <NamedLink className={classNames(css.root, className)} name="ListingPage" params={{ id, slug }}>
      <div className={css.imageWrapper}>
        <AspectRatioWrapper width={1} height={1} className={css.aspectRatio}>
          <LazyImage
            rootClassName={css.image}
            alt={[brand, name].filter(Boolean).join(' ')}
            image={firstImage}
            variants={variants}
            sizes={renderSizes}
          />
        </AspectRatioWrapper>
        {conditionLabel ? (
          <span className={css.conditionBadge}>
            {conditionLabel}
          </span>
        ) : null}
        {/* FAIRWAY: a pickup-only item is no use to a buyer at the other end of
            the country, so it says so before they click */}
        {shipmentType === 'meetup' ? (
          <span className={css.pickupBadge}>
            <FormattedMessage id="FairwayListingCard.pickupOnly" />
          </span>
        ) : null}
      </div>

      <div className={css.info}>
        {canonicalBrand ? <span className={css.brand}>{canonicalBrand}</span> : null}
        {/* filter, not a plain join: a listing with neither title nor model
            rendered as " / Regular / 21.0°", leading separator and all. */}
        <span className={css.title}>{[name, ...specs].filter(Boolean).join(' / ')}</span>
        {formattedPrice ? <span className={css.price}>{formattedPrice}</span> : null}
      </div>
    </NamedLink>
  );
};

export default FairwayListingCard;
