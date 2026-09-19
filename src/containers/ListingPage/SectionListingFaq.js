import React from 'react';

import { FormattedMessage } from '../../util/reactIntl';
import { NamedLink } from '../../components';

import css from './ListingPage.module.css';

/**
 * FAIRWAY: the four questions a buyer asks before they commit, and the one the
 * seller asks. Built on <details> so it works without JavaScript, stays
 * keyboard-navigable for free, and is indexable — these are the long-tail
 * searches that bring people to a listing in the first place.
 */
const QUESTIONS = ['covered', 'shipping', 'notAsDescribed', 'payout', 'fee'];

const SectionListingFaq = () => (
  <section className={css.faqSection}>
    <h2 className={css.sectionTitle}>
      <FormattedMessage id="ListingPage.faqTitle" />
    </h2>

    <div className={css.faqList}>
      {QUESTIONS.map(q => (
        <details key={q} className={css.faqItem}>
          <summary className={css.faqQuestion}>
            <FormattedMessage id={`ListingPage.faq_${q}_q`} />
            <span className={css.faqMark} aria-hidden={true} />
          </summary>
          <p className={css.faqAnswer}>
            <FormattedMessage id={`ListingPage.faq_${q}_a`} />
          </p>
        </details>
      ))}
    </div>

    {/* SidelineSwap's "Have one to sell?" — the cheapest seller acquisition
        there is, because the visitor is already looking at their own gear. */}
    <div className={css.sellCta}>
      <div>
        <h3 className={css.sellCtaTitle}>
          <FormattedMessage id="ListingPage.sellCtaTitle" />
        </h3>
        <p className={css.sellCtaText}>
          <FormattedMessage id="ListingPage.sellCtaText" />
        </p>
      </div>
      <NamedLink className={css.sellCtaButton} name="NewListingPage">
        <FormattedMessage id="ListingPage.sellCtaButton" />
      </NamedLink>
    </div>
  </section>
);

export default SectionListingFaq;
