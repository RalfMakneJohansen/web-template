import React, { useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';

import { FormattedMessage } from '../../util/reactIntl';

import { NamedLink } from '../../components';
import ShareListingButton from '../../components/OrderPanel/ShareListingButton/ShareListingButton';

import css from './PublishedCelebration.module.css';

// The history state flag EditListingPage sets when it redirects after publishing.
export const JUST_PUBLISHED = 'fairwayJustPublished';

const BURST = Array.from({ length: 10 }, (_, i) => i);

/**
 * FAIRWAY: the moment a listing goes live.
 *
 * Shown once, to the seller, right after publishing (history state, not the
 * URL, so it can't be shared or bookmarked by accident). A tick that draws
 * itself with a small burst, and the two things worth doing next: share it
 * where golfers are, and see it on Min side.
 *
 * @component
 * @param {Object} props
 * @param {Object} props.listing - The listing just published
 * @param {boolean} props.isOwnListing
 * @returns {JSX.Element|null}
 */
const PublishedCelebration = props => {
  const { listing, isOwnListing } = props;
  const location = useLocation();
  const history = useHistory();
  const [dismissed, setDismissed] = useState(false);

  if (!isOwnListing || dismissed || !location?.state?.[JUST_PUBLISHED]) {
    return null;
  }

  const onClose = () => {
    setDismissed(true);
    // Forget the flag, so going back or reloading doesn't celebrate again
    history.replace({ ...location, state: { ...location.state, [JUST_PUBLISHED]: false } });
  };

  return (
    <section className={css.root} role="status" aria-labelledby="published-title">
      <div className={css.mark} aria-hidden={true}>
        {BURST.map(i => (
          <span key={i} className={css.spark} style={{ '--i': i }} />
        ))}
        <svg className={css.check} width="56" height="56" viewBox="0 0 56 56">
          <circle className={css.ring} cx="28" cy="28" r="25" />
          <path className={css.tick} d="m17 29 7.5 7.5L40 21" />
        </svg>
      </div>
      <div className={css.body}>
        <h2 id="published-title" className={css.title}>
          <FormattedMessage id="PublishedCelebration.title" />
        </h2>
        <p className={css.text}>
          <FormattedMessage id="PublishedCelebration.text" />
        </p>
        <div className={css.actions}>
          <ShareListingButton listingId={listing?.id} title={listing?.attributes?.title} />
          <NamedLink name="OverviewPage" className={css.link}>
            <FormattedMessage id="PublishedCelebration.toOverview" />
          </NamedLink>
        </div>
      </div>
      <button type="button" className={css.close} onClick={onClose}>
        <span className={css.closeLabel}>
          <FormattedMessage id="PublishedCelebration.close" />
        </span>
        <span aria-hidden={true}>×</span>
      </button>
    </section>
  );
};

export default PublishedCelebration;
