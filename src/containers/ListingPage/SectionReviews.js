import React from 'react';
import { FormattedMessage } from '../../util/reactIntl';
import { Heading, H2, Reviews } from '../../components';

import css from './ListingPage.module.css';

const SectionReviews = props => {
  const { reviews, fetchReviewsError } = props;

  // FAIRWAY: an empty review list is not shown at all.
  //
  // Every listing carried a heading reading "Anmeldelser (0)". On a
  // marketplace whose whole pitch is that buying here is safe, printing a
  // zero on each product page argues the opposite - it makes a new site look
  // abandoned rather than new. Nothing there says nothing, which is true and
  // costs no trust. The section appears by itself with the first review.
  //
  // A fetch error still shows, because that is a fault the buyer should see
  // rather than an absence.
  if (reviews.length === 0 && !fetchReviewsError) {
    return null;
  }

  return (
    <section className={css.sectionReviews}>
      <Heading as="h2" rootClassName={css.sectionHeadingWithExtraMargin}>
        <FormattedMessage id="ListingPage.reviewsTitle" values={{ count: reviews.length }} />
      </Heading>
      {fetchReviewsError ? (
        <H2 className={css.errorText}>
          <FormattedMessage id="ListingPage.reviewsError" />
        </H2>
      ) : null}
      <Reviews reviews={reviews} />
    </section>
  );
};

export default SectionReviews;
