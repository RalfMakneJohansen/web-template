import React from 'react';

import { useConfiguration } from '../../context/configurationContext';

import { LayoutSingleColumn, Page } from '../../components';
import TopbarContainer from '../TopbarContainer/TopbarContainer';
import FairwayFooter from '../LandingPage/FairwayFooter';

import css from './LocalInfoPage.module.css';

const Section = props => {
  const { section } = props;

  return (
    <section className={css.section}>
      {section.heading ? <h2 className={css.heading}>{section.heading}</h2> : null}

      {section.type === 'paragraph' ? <p className={css.text}>{section.text}</p> : null}

      {section.type === 'list' ? (
        <ul className={css.list}>
          {section.items.map(item => (
            <li key={item} className={css.listItem}>
              {item}
            </li>
          ))}
        </ul>
      ) : null}

      {section.type === 'steps' ? (
        <ol className={css.steps}>
          {section.items.map((item, index) => (
            <li key={item} className={css.step}>
              <span className={css.stepNumber}>{index + 1}</span>
              <span className={css.stepText}>{item}</span>
            </li>
          ))}
        </ol>
      ) : null}

      {section.type === 'faq' ? (
        <dl className={css.faq}>
          {section.items.map(item => (
            <div key={item.q} className={css.faqItem}>
              <dt className={css.faqQuestion}>{item.q}</dt>
              <dd className={css.faqAnswer}>{item.a}</dd>
            </div>
          ))}
        </dl>
      ) : null}
    </section>
  );
};

/**
 * Renders a locally defined info page. Used when Console has no hosted page
 * for the requested slug.
 *
 * @param {Object} props
 * @param {Object} props.page entry from localPages.js
 */
const LocalInfoPage = props => {
  const { page } = props;
  const config = useConfiguration();

  return (
    <Page title={`${page.title} | ${config.marketplaceName}`} description={page.intro}>
      <LayoutSingleColumn topbar={<TopbarContainer />} footer={<FairwayFooter />}>
        <article className={css.root}>
          <header className={css.header}>
            <h1 className={css.title}>{page.title}</h1>
            <p className={css.intro}>{page.intro}</p>
          </header>

          {page.sections.map((section, index) => (
            <Section key={section.heading || index} section={section} />
          ))}
        </article>
      </LayoutSingleColumn>
    </Page>
  );
};

export default LocalInfoPage;
