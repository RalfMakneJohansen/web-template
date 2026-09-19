import React from 'react';
import { FormattedMessage } from '../../../util/reactIntl';
import { NamedLink } from '../../../components';

import css from './NoSearchResultsMaybe.module.css';

/**
 * FAIRWAY: the empty state.
 *
 * With a small inventory this is the screen people hit most, so it is designed
 * rather than left as a line of text. It does three things in order: says
 * plainly that there is nothing, offers the way out that usually works
 * (clearing the filters), and then offers the other side of the marketplace —
 * someone who cannot find a driver today is a good candidate for selling one.
 */
const SearchIcon = () => (
  <svg
    width="28"
    height="28"
    viewBox="0 0 28 28"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden={true}
  >
    <circle cx="12.4" cy="12.4" r="8.2" />
    <path d="m18.4 18.4 5.2 5.2" />
  </svg>
);

const NoSearchResultsMaybe = props => {
  const { listingsAreLoaded, totalItems, location, resetAll, showCreateListingsLink } = props;
  const hasNoResult = listingsAreLoaded && totalItems === 0;
  const hasSearchParams = location.search?.length > 0;

  if (!hasNoResult) {
    return null;
  }

  return (
    <div className={css.root}>
      <span className={css.icon}>
        <SearchIcon />
      </span>

      <h2 className={css.title}>
        <FormattedMessage id="SearchPage.noResults" />
      </h2>
      <p className={css.text}>
        <FormattedMessage
          id={hasSearchParams ? 'SearchPage.noResultsFiltered' : 'SearchPage.noResultsEmpty'}
        />
      </p>

      <div className={css.actions}>
        {hasSearchParams ? (
          <button type="button" className={css.primaryAction} onClick={e => resetAll(e)}>
            <FormattedMessage id="SearchPage.resetAllFilters" />
          </button>
        ) : null}
        {showCreateListingsLink ? (
          <NamedLink className={css.secondaryAction} name="NewListingPage">
            <FormattedMessage id="SearchPage.createListing" />
          </NamedLink>
        ) : null}
      </div>
    </div>
  );
};

export default NoSearchResultsMaybe;
