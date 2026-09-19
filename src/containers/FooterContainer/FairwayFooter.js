import React from 'react';

import { NamedLink } from '../../components';

import wordmark from '../../assets/fairway-wordmark-light.png';

import css from './FairwayFooter.module.css';

const COLUMNS = [
  {
    title: 'Køb',
    links: [
      { label: 'Alt udstyr', name: 'SearchPage' },
      { label: 'Drivere', name: 'SearchPage', search: '?pub_categoryLevel1=driver' },
      { label: 'Jernsæt', name: 'SearchPage', search: '?pub_categoryLevel1=jernsaet' },
      { label: 'Puttere', name: 'SearchPage', search: '?pub_categoryLevel1=putter' },
      { label: 'Bags', name: 'SearchPage', search: '?pub_categoryLevel1=bag' },
      { label: 'Sko', name: 'SearchPage', search: '?pub_categoryLevel1=sko' },
    ],
  },
  {
    title: 'Sælg',
    links: [
      { label: 'Opret annonce', name: 'NewListingPage' },
      { label: 'Sådan pakker du udstyret', name: 'CMSPage', params: { pageId: 'saadan-pakker-du' } },
      { label: 'Gratis forsendelseskasse', name: 'CMSPage', params: { pageId: 'forsendelse' } },
    ],
  },
  {
    title: 'Om Fairway',
    links: [
      { label: 'Sådan fungerer det', name: 'CMSPage', params: { pageId: 'saadan-fungerer-det' } },
      { label: 'Tryghed og escrow', name: 'CMSPage', params: { pageId: 'tryghed' } },
    ],
  },
  {
    title: 'Support',
    links: [
      { label: 'Kontakt', name: 'CMSPage', params: { pageId: 'kontakt' } },
      { label: 'Ofte stillede spørgsmål', name: 'CMSPage', params: { pageId: 'faq' } },
      { label: 'Handelsbetingelser', name: 'TermsOfServicePage' },
      { label: 'Privatlivspolitik', name: 'PrivacyPolicyPage' },
    ],
  },
];

/**
 * Fairway's own footer: link columns plus the trust promise.
 * Replaces the hosted-asset footer on pages that use it.
 */
const FairwayFooter = () => {
  const year = new Date().getFullYear();

  return (
    <footer className={css.root}>
      <div className={css.promise}>
        Escrow-beskyttet betaling · Forsikret fragt · 48 timers inspektion før pengene frigives
      </div>

      <div className={css.inner}>
        <div className={css.brand}>
          <NamedLink name="LandingPage" className={css.brandLink}>
            <img className={css.brandLogo} src={wordmark} alt="Fairway" />
          </NamedLink>
          <p className={css.brandText}>
            Markedspladsen for brugt golfudstyr i Danmark. Vi står imellem køber og sælger, så
            ingen af jer løber en risiko.
          </p>
        </div>

        <div className={css.columns}>
          {COLUMNS.map(column => (
            <nav key={column.title} className={css.column} aria-label={column.title}>
              <h3 className={css.columnTitle}>{column.title}</h3>
              <ul>
                {column.links.map(link => (
                  <li key={link.label}>
                    <NamedLink
                      name={link.name}
                      params={link.params}
                      to={link.search ? { search: link.search } : {}}
                      className={css.link}
                    >
                      {link.label}
                    </NamedLink>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className={css.bottom}>
          <span>© {year} Fairway</span>
          <NamedLink name="TermsOfServicePage" className={css.bottomLink}>
            Vilkår
          </NamedLink>
          <NamedLink name="PrivacyPolicyPage" className={css.bottomLink}>
            Privatlivspolitik
          </NamedLink>
        </div>
      </div>
    </footer>
  );
};

export default FairwayFooter;
