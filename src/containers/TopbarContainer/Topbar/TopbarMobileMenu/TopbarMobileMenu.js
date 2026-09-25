/**
 *  TopbarMobileMenu prints the menu content for authenticated user or
 * shows login actions for those who are not authenticated.
 */
import React from 'react';
import classNames from 'classnames';

import { ACCOUNT_SETTINGS_PAGES } from '../../../../routing/routeConfiguration';
import { FormattedMessage, useIntl } from '../../../../util/reactIntl';
import { ensureCurrentUser } from '../../../../util/data';

import { AvatarMedium, ExternalLink, NamedLink, NotificationBadge } from '../../../../components';

import wordmark from '../../../../assets/fairway-logo-horizontal.png';

import MobileMenuCategories from './MobileMenuCategories';
import css from './TopbarMobileMenu.module.css';

// Line icons on one 24px grid, so every row of the menu reads alike.
const ICON_PATHS = {
  home: (
    <>
      <path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-4.5v-6h-5v6H5a1 1 0 0 1-1-1v-9.5Z" />
    </>
  ),
  explore: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="m15.5 8.5-2 5-5 2 2-5 5-2Z" />
    </>
  ),
  shield: (
    <>
      <path d="M12 3.5 5 6v5.5c0 4.3 3 7.6 7 9 4-1.4 7-4.7 7-9V6l-7-2.5Z" />
      <path d="m9 12 2.2 2.2L15.5 10" />
    </>
  ),
  sell: (
    <>
      <path d="M3.5 12.9V5a1.5 1.5 0 0 1 1.5-1.5h7.9l7.6 7.6a1.5 1.5 0 0 1 0 2.1l-6.4 6.4a1.5 1.5 0 0 1-2.1 0l-8.5-6.7Z" />
      <circle cx="8" cy="8" r="1.4" />
    </>
  ),
  inbox: (
    <>
      <path d="M4 13.5 6.5 5h11l2.5 8.5V19a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-5.5Z" />
      <path d="M4 13.5h4.5l1 2h5l1-2H20" />
    </>
  ),
  listings: (
    <>
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <path d="M8 9h8M8 12.5h8M8 16h5" />
    </>
  ),
  profile: (
    <>
      <circle cx="12" cy="8.5" r="3.8" />
      <path d="M4.5 20c1.3-3.4 4.1-5.2 7.5-5.2s6.2 1.8 7.5 5.2" />
    </>
  ),
  settings: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M19 12a7 7 0 0 0-.1-1.2l2-1.5-2-3.4-2.3.9a7 7 0 0 0-2-1.2L14.2 3h-4l-.4 2.6a7 7 0 0 0-2 1.2l-2.4-.9-2 3.4 2 1.5A7 7 0 0 0 5 12c0 .4 0 .8.1 1.2l-2 1.5 2 3.4 2.4-.9c.6.5 1.3.9 2 1.2l.4 2.6h4l.4-2.6c.7-.3 1.4-.7 2-1.2l2.3.9 2-3.4-2-1.5c.1-.4.1-.8.1-1.2Z" />
    </>
  ),
  logout: (
    <>
      <path d="M14 4h4a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-4" />
      <path d="M10 16.5 5.5 12 10 7.5M5.5 12H15" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="6.5" />
      <path d="m20 20-4.2-4.2" />
    </>
  ),
};

const Icon = ({ name, className }) => (
  <svg
    className={classNames(css.icon, className)}
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden={true}
  >
    {ICON_PATHS[name]}
  </svg>
);

// One row of the menu: an icon and a label, a dark pill when it is the page you're on.
const MenuLink = props => {
  const { name, params, to, icon, isCurrent, children } = props;
  return (
    <li>
      <NamedLink
        name={name}
        params={params}
        to={to}
        className={classNames(css.menuLink, { [css.menuLinkCurrent]: isCurrent })}
        aria-current={isCurrent ? 'page' : undefined}
      >
        <Icon name={icon} />
        <span className={css.menuLabel}>{children}</span>
      </NamedLink>
    </li>
  );
};

const CustomLinkComponent = ({ linkConfig, currentPage }) => {
  const { text, type, href, route } = linkConfig;

  // Note: if the config contains 'route' keyword,
  // then in-app linking config has been resolved already.
  if (type === 'internal' && route) {
    const { name, params, to } = route || {};
    const isCMSPage = currentPage === `${name}:${params?.pageId}`;
    return (
      <li>
        <NamedLink
          name={name}
          params={params}
          to={to}
          className={classNames(css.textLink, {
            [css.textLinkCurrent]: isCMSPage || currentPage === name,
          })}
        >
          {text}
        </NamedLink>
      </li>
    );
  }
  return (
    <li>
      <ExternalLink href={href} className={css.textLink}>
        {text}
      </ExternalLink>
    </li>
  );
};

/**
 * Menu for mobile layout (opens through hamburger icon)
 *
 * FAIRWAY: laid out like an app's side menu — the mark, a search field, the
 * main places with icons and the page you're on as a dark pill, one clear
 * "sell" button, then your account under a card with your name, and log out
 * last, in red, where nobody hits it by accident.
 *
 * @component
 * @param {Object} props
 * @param {boolean} props.isAuthenticated
 * @param {string?} props.currentPage
 * @param {string?} props.inboxTab
 * @param {boolean} props.showCreateListingsLink
 * @param {Object?} props.currentUser API entity
 * @param {number} props.notificationCount
 * @param {Array<Object>} props.customLinks Contains object like { group, text, type, href, route }
 * @param {Function} props.onLogout
 * @param {Function} [props.onSearchSubmit] ({ keywords }) => void
 * @returns {JSX.Element}
 */
const TopbarMobileMenu = props => {
  const {
    isAuthenticated,
    currentPage,
    inboxTab,
    currentUser,
    notificationCount = 0,
    customLinks = [],
    onLogout,
    onSearchSubmit,
    showCreateListingsLink,
  } = props;
  const intl = useIntl();

  const user = ensureCurrentUser(currentUser);
  const isCurrent = page => currentPage === page;
  const isAccountPage = ACCOUNT_SETTINGS_PAGES.includes(currentPage);
  const isInbox = currentPage?.indexOf('InboxPage') === 0;

  const handleSearch = e => {
    e.preventDefault();
    const keywords = new FormData(e.currentTarget)
      .get('keywords')
      ?.toString()
      .trim();
    if (onSearchSubmit) {
      onSearchSubmit({ keywords: keywords || undefined });
    }
  };

  const extraLinks = customLinks.map((linkConfig, index) => (
    <CustomLinkComponent
      key={`${linkConfig.text}_${index}`}
      linkConfig={linkConfig}
      currentPage={currentPage}
    />
  ));

  const { firstName, lastName, displayName } = user.attributes.profile || {};
  const fullName = [firstName, lastName].filter(Boolean).join(' ') || displayName;

  return (
    <nav className={css.root} aria-label={intl.formatMessage({ id: 'TopbarMobileMenu.menuTitle' })}>
      <div className={css.brandRow}>
        <img className={css.brandLogo} src={wordmark} alt="Fairway" />
        <span className={css.brandTitle}>
          <FormattedMessage id="TopbarMobileMenu.menuTitle" />
        </span>
      </div>

      <form className={css.search} role="search" onSubmit={handleSearch}>
        <Icon name="search" className={css.searchIcon} />
        <input
          className={css.searchInput}
          type="search"
          name="keywords"
          enterKeyHint="search"
          aria-label={intl.formatMessage({ id: 'TopbarMobileMenu.searchLabel' })}
          placeholder={intl.formatMessage({ id: 'TopbarMobileMenu.searchPlaceholder' })}
        />
      </form>

      <ul className={css.menuList}>
        <MenuLink name="LandingPage" icon="home" isCurrent={isCurrent('LandingPage')}>
          <FormattedMessage id="TopbarMobileMenu.homeLink" />
        </MenuLink>
        <MenuLink name="SearchPage" icon="explore" isCurrent={isCurrent('SearchPage')}>
          <FormattedMessage id="TopbarMobileMenu.browseAll" />
        </MenuLink>
        <MenuLink
          name="CMSPage"
          params={{ pageId: 'saadan-fungerer-det' }}
          icon="shield"
          isCurrent={isCurrent('CMSPage:saadan-fungerer-det')}
        >
          <FormattedMessage id="TopbarMobileMenu.howItWorksLink" />
        </MenuLink>
      </ul>

      {showCreateListingsLink ? (
        <NamedLink name="NewListingPage" className={css.sellButton}>
          <Icon name="sell" />
          <FormattedMessage id="TopbarMobileMenu.sellLink" />
        </NamedLink>
      ) : null}

      <hr className={css.divider} />

      {isAuthenticated ? (
        <>
          <div className={css.userCard}>
            <AvatarMedium className={css.avatar} user={currentUser} disableProfileLink />
            <div className={css.userText}>
              <span className={css.userName}>{fullName}</span>
              {user.attributes.email ? (
                <span className={css.userEmail}>{user.attributes.email}</span>
              ) : null}
            </div>
          </div>

          <ul className={css.menuList}>
            <li>
              <NamedLink
                name="InboxPage"
                params={{ tab: inboxTab }}
                className={classNames(css.menuLink, { [css.menuLinkCurrent]: isInbox })}
                aria-current={isInbox ? 'page' : undefined}
              >
                <Icon name="inbox" />
                <span className={css.menuLabel}>
                  <FormattedMessage id="TopbarMobileMenu.inboxLink" />
                </span>
                {notificationCount > 0 ? (
                  <NotificationBadge className={css.badge} count={notificationCount} />
                ) : null}
              </NamedLink>
            </li>
            {showCreateListingsLink ? (
              <MenuLink
                name="ManageListingsPage"
                icon="listings"
                isCurrent={isCurrent('ManageListingsPage')}
              >
                <FormattedMessage id="TopbarMobileMenu.yourListingsLink" />
              </MenuLink>
            ) : null}
            <MenuLink
              name="ProfileSettingsPage"
              icon="profile"
              isCurrent={isCurrent('ProfileSettingsPage')}
            >
              <FormattedMessage id="TopbarMobileMenu.profileSettingsLink" />
            </MenuLink>
            <MenuLink name="AccountSettingsPage" icon="settings" isCurrent={isAccountPage}>
              <FormattedMessage id="TopbarMobileMenu.accountSettingsLink" />
            </MenuLink>
            <li>
              <button type="button" className={css.logoutButton} onClick={onLogout}>
                <Icon name="logout" />
                <span className={css.menuLabel}>
                  <FormattedMessage id="TopbarMobileMenu.logoutLink" />
                </span>
              </button>
            </li>
          </ul>
        </>
      ) : (
        <div className={css.welcome}>
          <p className={css.welcomeTitle}>
            <FormattedMessage id="TopbarMobileMenu.welcomeTitle" />
          </p>
          <p className={css.welcomeText}>
            <FormattedMessage id="TopbarMobileMenu.welcomeText" />
          </p>
          <div className={css.authenticationLinks}>
            <NamedLink name="SignupPage" className={css.signupLink}>
              <FormattedMessage id="TopbarMobileMenu.signupLink" />
            </NamedLink>
            <NamedLink name="LoginPage" className={css.loginLink}>
              <FormattedMessage id="TopbarMobileMenu.loginLink" />
            </NamedLink>
          </div>
        </div>
      )}

      <MobileMenuCategories />

      {extraLinks.length > 0 ? <ul className={css.textLinks}>{extraLinks}</ul> : null}
    </nav>
  );
};

export default TopbarMobileMenu;
