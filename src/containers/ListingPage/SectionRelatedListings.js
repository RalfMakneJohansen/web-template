import React from 'react';
import { useSelector } from 'react-redux';

import { FormattedMessage } from '../../util/reactIntl';
import { useConfiguration } from '../../context/configurationContext';
import { NamedLink } from '../../components';
import FairwayListingCard from '../../components/FairwayListingCard/FairwayListingCard';

import css from './ListingPage.module.css';

/**
 * FAIRWAY: the strip that keeps a visit alive.
 *
 * A used-gear buyer almost never buys the first club they open — they compare.
 * If the comparison has to happen by pressing Back, most of it happens on
 * someone else's site instead.
 *
 * Renders nothing at all while loading or when there is nothing to show: an
 * empty "you might also like" row is worse than no row.
 */
const SectionRelatedListings = props => {
  const { categoryId } = props;
  const config = useConfiguration();
  const listings = useSelector(state => state.ListingPage.relatedListings) || [];

  if (listings.length === 0) {
    return null;
  }

  const categoryLabel = config.categoryConfiguration?.categories?.find(c => c.id === categoryId)
    ?.name;

  return (
    <section className={css.relatedSection}>
      <div className={css.relatedHead}>
        <h2 className={css.sectionTitle}>
          {categoryLabel ? (
            // The label is used as it is written. Lower-casing it produced
            // "Flere driver" — Danish nouns do not pluralise by being made
            // small, and there is no rule that turns every category name into
            // a correct plural. "Mere i Driver" is right for all of them.
            <FormattedMessage
              id="ListingPage.relatedTitleCategory"
              values={{ category: categoryLabel }}
            />
          ) : (
            <FormattedMessage id="ListingPage.relatedTitle" />
          )}
        </h2>
        <NamedLink
          className={css.relatedAll}
          name="SearchPage"
          to={{ search: categoryId ? `?pub_categoryLevel1=${categoryId}` : '' }}
        >
          <FormattedMessage id="ListingPage.relatedSeeAll" />
        </NamedLink>
      </div>

      {/* A scroller on small screens, a grid from tablet up — the same pattern
          as the search results, so the two never look like different sites. */}
      <div className={css.relatedRow}>
        {listings.map(l => (
          <FairwayListingCard
            key={l.id.uuid}
            className={css.relatedCard}
            listing={l}
            renderSizes="(max-width: 767px) 44vw, (max-width: 1023px) 30vw, 22vw"
          />
        ))}
      </div>
    </section>
  );
};

export default SectionRelatedListings;
