import React from 'react';

import { FormattedMessage } from '../../util/reactIntl';
import { SectionWave } from '../../components';

import css from './ListingPage.module.css';

/**
 * FAIRWAY: what happens after "Køb nu".
 *
 * The single biggest reason a second-hand purchase is abandoned is not price —
 * it is not knowing what happens to the money. Four steps, stated before the
 * buyer has to ask.
 */
const STEPS = ['pay', 'pack', 'check', 'release'];

const SectionBuyerJourney = () => (
  <section className={css.journeySection}>
    {/* Same curved edge the front page uses at every section boundary. This is
        a full-width band, so it sits outside the page's content container and
        carries its own. */}
    <SectionWave position="top" />

    <div className={css.journeyInner}>
      <h2 className={css.sectionTitle}>
        <FormattedMessage id="ListingPage.journeyTitle" />
      </h2>

      <ol className={css.journeySteps}>
        {STEPS.map((step, i) => (
          <li key={step} className={css.journeyStep}>
            <span className={css.journeyNumber}>{i + 1}</span>
            <h3 className={css.journeyStepTitle}>
              <FormattedMessage id={`ListingPage.journey_${step}_title`} />
            </h3>
            <p className={css.journeyStepText}>
              <FormattedMessage id={`ListingPage.journey_${step}_text`} />
            </p>
          </li>
        ))}
      </ol>
    </div>

    <SectionWave position="bottom" />
  </section>
);

export default SectionBuyerJourney;
