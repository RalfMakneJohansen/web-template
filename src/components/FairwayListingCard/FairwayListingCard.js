import React from 'react';
import classNames from 'classnames';

import { useConfiguration } from '../../context/configurationContext';
import { useIntl } from '../../util/reactIntl';
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

const conditionClass = condition =>
  ({
    'som-ny': css.conditionSomNy,
    god: css.conditionGod,
    okay: css.conditionOkay,
    slidt: css.conditionSlidt,
  }[condition]);

/**
 * The spec line is the difference between a classifieds tile and a product
 * tile: it lets a buyer compare two drivers without opening either.
 *
 * Read off the listing field config rather than hard-coded, so the labels stay
 * correct when an option is renamed, and so a field that does not apply to the
 * category simply drops out.
 */
const SPEC_KEYS = ['loft', 'wedge_loft', 'shaft_flex', 'putter_length', 'shoe_size', 'dexterity'];

const specLine = (publicData, listingFields) => {
  if (!publicData) {
    return null;
  }
  const parts = SPEC_KEYS.map(key => {
    const raw = publicData[key];
    if (raw == null || raw === '') {
      return null;
    }
    const field = listingFields.find(f => f.key === key);
    const option = field?.enumOptions?.find(o => `${o.option}` === `${raw}`);
    return option?.label || raw;
  }).filter(Boolean);

  return parts.length > 0 ? parts.slice(0, 3).join(' · ') : null;
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
  const { brand, model, condition } = publicData || {};
  const slug = createSlug(title);

  const { variantPrefix = 'listing-card' } = config.layout.listingImage;

  const firstImage = listing?.images?.[0] || null;
  const variants = firstImage
    ? Object.keys(firstImage.attributes?.variants || {}).filter(k => k.startsWith(variantPrefix))
    : [];

  const formattedPrice =
    price && price.currency === config.currency ? formatMoney(intl, price) : null;

  const conditionLabel = CONDITION_LABELS[condition];
  const spec = specLine(publicData, config.listing.listingFields || []);

  // The model is the product name; the title is the seller's own wording and
  // only stands in when no model was given.
  const name = model || title;

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
          <span className={classNames(css.conditionBadge, conditionClass(condition))}>
            {conditionLabel}
          </span>
        ) : null}
      </div>

      <div className={css.info}>
        {brand ? <span className={css.brand}>{brand}</span> : null}
        <span className={css.title}>{name}</span>
        {spec ? <span className={css.meta}>{spec}</span> : null}
        {formattedPrice ? <span className={css.price}>{formattedPrice}</span> : null}
      </div>
    </NamedLink>
  );
};

export default FairwayListingCard;
