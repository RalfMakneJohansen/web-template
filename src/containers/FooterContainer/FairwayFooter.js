import React from 'react';

import { FormattedMessage, useIntl } from '../../util/reactIntl';

import { ExternalLink, NamedLink } from '../../components';

// The dark mark, same as the topbar: the footer is white now, and the
// light wordmark was invisible on it.
import wordmark from '../../assets/fairway-logo-horizontal.png';

import NewsletterSignup from './NewsletterSignup';
import css from './FairwayFooter.module.css';

// FAIRWAY: Fairway's social profiles. An icon shows once its address is set here.
export const SOCIAL_LINKS = {
  facebook: null, // e.g. 'https://www.facebook.com/fairwaydk'
  instagram: null, // e.g. 'https://www.instagram.com/fairwaydk'
};

const SOCIAL_ICONS = {
  facebook: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden={true}>
      <path d="M13.5 21v-7.5h2.53l.38-2.94H13.5V8.69c0-.85.24-1.43 1.46-1.43h1.56V4.63a20.9 20.9 0 0 0-2.27-.12c-2.25 0-3.79 1.37-3.79 3.9v2.15H7.92v2.94h2.54V21h3.04Z" />
    </svg>
  ),
  instagram: (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      className={css.lineIcon}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      aria-hidden={true}
    >
      <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.3" cy="6.7" r="1" fill="currentColor" stroke="none" />
    </svg>
  ),
};

const SOCIAL_NAMES = { facebook: 'Facebook', instagram: 'Instagram' };

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
      {
        label: 'Sådan pakker du udstyret',
        name: 'CMSPage',
        params: { pageId: 'saadan-pakker-du' },
      },
      { label: 'Fragt og forsendelseskasse', name: 'CMSPage', params: { pageId: 'forsendelse' } },
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
      { label: 'Spørgsmål og svar', name: 'CMSPage', params: { pageId: 'faq' } },
      { label: 'Handelsbetingelser', name: 'TermsOfServicePage' },
      { label: 'Privatlivspolitik', name: 'PrivacyPolicyPage' },
    ],
  },
];

/**
 * Fairway's own footer: the newsletter, link columns, social profiles and the
 * trust promise. Replaces the hosted-asset footer on pages that use it.
 *
 * @param {Object} props
 * @param {Object} [props.socialLinks] - { facebook, instagram } URLs; defaults to SOCIAL_LINKS
 */
const FairwayFooter = props => {
  const { socialLinks = SOCIAL_LINKS } = props;
  const intl = useIntl();
  const year = new Date().getFullYear();
  const socials = Object.keys(SOCIAL_ICONS).filter(key => socialLinks?.[key]);

  return (
    <footer className={css.root}>
      <div className={css.promise}>
        Escrow-beskyttet betaling · Forsikret fragt · 48 timers inspektion før pengene frigives
      </div>

      <div className={css.inner}>
        <NewsletterSignup />

        <div className={css.brand}>
          <NamedLink name="LandingPage" className={css.brandLink}>
            <img className={css.brandLogo} src={wordmark} alt="Fairway" />
          </NamedLink>
          <p className={css.brandText}>
            Brugt golfudstyr, købt og solgt trygt. Vi holder på pengene, til køber er tilfreds.
          </p>
          {socials.length > 0 ? (
            <div className={css.social}>
              <span className={css.socialLabel}>
                <FormattedMessage id="FairwayFooter.followUs" />
              </span>
              <ul className={css.socialList}>
                {socials.map(key => (
                  <li key={key}>
                    <ExternalLink
                      href={socialLinks[key]}
                      className={css.socialLink}
                      title={SOCIAL_NAMES[key]}
                      aria-label={intl.formatMessage(
                        { id: 'FairwayFooter.followOn' },
                        { network: SOCIAL_NAMES[key] }
                      )}
                    >
                      {SOCIAL_ICONS[key]}
                    </ExternalLink>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
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
