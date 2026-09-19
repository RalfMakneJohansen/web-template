import React, { useState } from 'react';

import { FormattedMessage } from '../../../util/reactIntl';
import { EVENTS, track } from '../../../analytics/track';

import css from './ShareListingButton.module.css';

/**
 * FAIRWAY: sharing a find is how used-gear listings actually travel — into a
 * club WhatsApp group, not onto a timeline.
 *
 * Uses the native share sheet where there is one (every phone), and falls back
 * to copying the link with a confirmation, so the button never does nothing.
 */
const ShareListingButton = props => {
  const { listingId, title } = props;
  const [copied, setCopied] = useState(false);

  const onShare = async () => {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    track(EVENTS.LISTING_SHARED, { listing_id: listingId?.uuid });

    try {
      if (typeof navigator !== 'undefined' && navigator.share) {
        await navigator.share({ title, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2400);
    } catch (e) {
      // The share sheet was dismissed, or the clipboard was refused. Neither is
      // something to tell the visitor about.
    }
  };

  return (
    <button type="button" className={css.root} onClick={onShare}>
      <svg
        width="16"
        height="16"
        viewBox="0 0 20 20"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden={true}
      >
        <circle cx="15" cy="4.4" r="2.2" />
        <circle cx="5" cy="10" r="2.2" />
        <circle cx="15" cy="15.6" r="2.2" />
        <path d="m6.9 8.9 6.2-3.4M6.9 11.1l6.2 3.4" />
      </svg>
      <FormattedMessage id={copied ? 'ShareListingButton.copied' : 'ShareListingButton.share'} />
    </button>
  );
};

export default ShareListingButton;
