import React, { useState } from 'react';
import classNames from 'classnames';

import { FormattedMessage, useIntl } from '../../util/reactIntl';

import { NamedLink } from '../../components';

import css from './ListingDescription.module.css';

// Past this many characters or lines, the text starts folded.
const FOLD_CHARS = 320;
const FOLD_LINES = 6;

export const shouldFold = text =>
  typeof text === 'string' && (text.length > FOLD_CHARS || text.split('\n').length > FOLD_LINES);

/**
 * FAIRWAY: the seller's description, and the listing's small print.
 *
 * A long description starts folded with "Vis mere", so the specs and the
 * seller are not pushed off the screen. Under it: the listing number (for
 * support), when it was put up, and links to sell something like it or to
 * report it.
 *
 * @component
 * @param {Object} props
 * @param {string} [props.className]
 * @param {string} [props.text] - The description
 * @param {Object} props.listing - The listing (id, createdAt, publicData)
 * @param {boolean} [props.isOwnListing]
 * @returns {JSX.Element}
 */
const ListingDescription = props => {
  const { className, text, listing, isOwnListing } = props;
  const intl = useIntl();
  const [open, setOpen] = useState(false);
  const foldable = shouldFold(text);

  const uuid = listing?.id?.uuid || '';
  const listingNumber = uuid
    .replace(/-/g, '')
    .slice(0, 8)
    .toUpperCase();
  const createdAt = listing?.attributes?.createdAt;

  return (
    <section className={classNames(css.root, className)} aria-labelledby="listing-description">
      {text ? (
        <>
          <h2 id="listing-description" className={css.heading}>
            <FormattedMessage id="ListingDescription.heading" />
          </h2>
          <p
            id="listing-description-text"
            className={classNames(css.text, { [css.folded]: foldable && !open })}
          >
            {text}
          </p>
          {foldable ? (
            <button
              type="button"
              className={css.toggle}
              aria-expanded={open}
              aria-controls="listing-description-text"
              onClick={() => setOpen(o => !o)}
            >
              <FormattedMessage id={open ? 'ListingDescription.less' : 'ListingDescription.more'} />
            </button>
          ) : null}
        </>
      ) : null}

      <div className={css.meta}>
        {listingNumber ? (
          <span>
            <FormattedMessage id="ListingDescription.number" values={{ number: listingNumber }} />
          </span>
        ) : null}
        {createdAt ? (
          <span>
            <FormattedMessage
              id="ListingDescription.created"
              values={{
                date: intl.formatDate(new Date(createdAt), { day: 'numeric', month: 'short' }),
              }}
            />
          </span>
        ) : null}
        <NamedLink name="NewListingPage" className={css.metaLink}>
          <FormattedMessage id="ListingDescription.sellSimilar" />
        </NamedLink>
        {!isOwnListing ? (
          <NamedLink name="CMSPage" params={{ pageId: 'kontakt' }} className={css.metaLink}>
            <FormattedMessage id="ListingDescription.report" />
          </NamedLink>
        ) : null}
      </div>
    </section>
  );
};

export default ListingDescription;
