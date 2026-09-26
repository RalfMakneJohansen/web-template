/**
 * This is a wrapper component for different Layouts.
 * Navigational 'aside' content should be added to this wrapper.
 */
import React, { useEffect, useState } from 'react';
import classNames from 'classnames';

import { FormattedMessage } from '../../../util/reactIntl';
import { getTradeReadiness } from '../../../util/fairwayContact';

import { NamedLink } from '../../../components';

import { createGlobalState } from './hookGlobalState';

import css from './LayoutSideNavigation.module.css';

const MAX_HORIZONTAL_NAV_SCREEN_WIDTH = 1023;

// Add global state for tab scrolling effect
const initialScrollState = { scrollLeft: 0 };
const { useGlobalState } = createGlobalState(initialScrollState);

// Horizontal scroll animation using element.scrollTo()
const scrollToTab = (currentPage, scrollLeft, setScrollLeft) => {
  const el = document.querySelector(`#${currentPage}Tab`);

  if (el) {
    // el.scrollIntoView doesn't work with Safari and it considers vertical positioning too.
    // This scroll behaviour affects horizontal scrolling only
    // and it expects that the immediate parent element is scrollable.
    const parent = el.parentElement;
    const parentRect = parent.getBoundingClientRect();
    const maxScrollDistance = parent.scrollWidth - parentRect.width;

    const hasParentScrolled = parent.scrollLeft > 0;
    const scrollPositionCurrent = hasParentScrolled ? parent.scrollLeft : scrollLeft;

    const tabRect = el.getBoundingClientRect();
    const diffLeftBetweenTabAndParent = tabRect.left - parentRect.left;
    const tabScrollPosition = parent.scrollLeft + diffLeftBetweenTabAndParent;

    const scrollPositionNew =
      tabScrollPosition > maxScrollDistance
        ? maxScrollDistance
        : parent.scrollLeft + diffLeftBetweenTabAndParent;

    const needsSmoothScroll = scrollPositionCurrent !== scrollPositionNew;

    if (parent.scrollTo && (!hasParentScrolled || (hasParentScrolled && needsSmoothScroll))) {
      // Ensure that smooth scroll animation uses old position as starting point after navigation.
      parent.scrollTo({ left: scrollPositionCurrent });
      // Scroll to new position
      parent.scrollTo({ left: scrollPositionNew, behavior: 'smooth' });
    }
    // Always keep track of new position (even if smooth scrolling is not applied)
    setScrollLeft(scrollPositionNew);
  }
};

// FAIRWAY: one line icon per settings page, so the row reads at a glance
const NAV_ICONS = {
  TradingGuidePage: (
    <>
      <path d="M9 4h6v3H9z" />
      <path d="M8 5.5H6v15h12v-15h-2" />
      <path d="m9 13 2 2 4-4" />
    </>
  ),
  ContactDetailsPage: (
    <>
      <rect x="3.5" y="5.5" width="17" height="13" rx="2" />
      <path d="m4 7 8 6 8-6" />
    </>
  ),
  PasswordChangePage: (
    <>
      <rect x="5" y="10.5" width="14" height="10" rx="2" />
      <path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" />
    </>
  ),
  StripePayoutPage: (
    <>
      <path d="M3 10h18L12 4 3 10Z" />
      <path d="M5.5 10v8M10 10v8M14 10v8M18.5 10v8M3 20h18" />
    </>
  ),
  PaymentMethodsPage: (
    <>
      <rect x="3" y="5.5" width="18" height="13" rx="2" />
      <path d="M3 10h18M7 15h3" />
    </>
  ),
  ManageAccountPage: (
    <>
      <circle cx="12" cy="8.5" r="3.5" />
      <path d="M5 20c.8-3.6 3.6-5.5 7-5.5s6.2 1.9 7 5.5" />
    </>
  ),
};

const NavIcon = ({ page }) => (
  <svg className={css.navIcon} width="20" height="20" viewBox="0 0 24 24" aria-hidden={true}>
    {NAV_ICONS[page]}
  </svg>
);

/**
 * FAIRWAY: which settings pages still need something from this user, so the
 * nav can put a dot on them. Everything is read off the current user.
 *
 * @param {Object} currentUser
 * @returns {Object<string, boolean>} page name → needs attention
 */
export const pagesNeedingAttention = currentUser => {
  if (!currentUser?.id) {
    return {};
  }
  const { emailVerified, payoutAccount, readyToSell } = getTradeReadiness(currentUser);
  return {
    TradingGuidePage: !readyToSell,
    ContactDetailsPage: !emailVerified,
    StripePayoutPage: !payoutAccount,
  };
};

/**
 * Side nav with navigation to different account settings.
 *
 * @component
 * @param {Object} props
 * @param {Object} props.accountSettingsNavProps
 * @param {string?} props.accountSettingsNavProps.currentPage
 * @param {boolean?} props.accountSettingsNavProps.showPaymentMethods
 * @param {boolean?} props.accountSettingsNavProps.showPayoutDetails
 * @param {Object?} props.accountSettingsNavProps.currentUser - For the dots on pages that need something
 * @returns {JSX.Element} Side nav with navigation to different account settings
 */
const LayoutWrapperAccountSettingsSideNav = props => {
  const [mounted, setMounted] = useState(false);
  const [scrollLeft, setScrollLeft] = useGlobalState('scrollLeft');
  const { accountSettingsNavProps, ariaLabel } = props;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      const { currentPage } = accountSettingsNavProps;
      const hasMatchMedia = typeof window !== 'undefined' && window?.matchMedia;
      const hasHorizontalTabLayout = hasMatchMedia
        ? window.matchMedia(`(max-width: ${MAX_HORIZONTAL_NAV_SCREEN_WIDTH}px)`)?.matches
        : true;

      // Check if scrollToTab call is needed (tab is not visible on mobile)
      if (hasHorizontalTabLayout) {
        scrollToTab(currentPage, scrollLeft, setScrollLeft);
      }
    }
  }, [mounted]);

  const { currentPage, showPaymentMethods, showPayoutDetails } = accountSettingsNavProps;
  const payoutDetailsMaybe = showPayoutDetails
    ? [
        {
          text: <FormattedMessage id="LayoutWrapperAccountSettingsSideNav.paymentsTabTitle" />,
          selected: currentPage === 'StripePayoutPage',
          id: 'StripePayoutPageTab',
          linkProps: {
            name: 'StripePayoutPage',
          },
        },
      ]
    : [];

  const paymentMethodsMaybe = showPaymentMethods
    ? [
        {
          text: (
            <FormattedMessage id="LayoutWrapperAccountSettingsSideNav.paymentMethodsTabTitle" />
          ),
          selected: currentPage === 'PaymentMethodsPage',
          id: 'PaymentMethodsPageTab',
          linkProps: {
            name: 'PaymentMethodsPage',
          },
        },
      ]
    : [];

  const tabs = [
    {
      // FAIRWAY: first, so the checklist is what "Kontoindstillinger" opens beside
      text: <FormattedMessage id="LayoutWrapperAccountSettingsSideNav.tradingGuideTabTitle" />,
      selected: currentPage === 'TradingGuidePage',
      id: 'TradingGuidePageTab',
      linkProps: {
        name: 'TradingGuidePage',
      },
    },
    {
      text: <FormattedMessage id="LayoutWrapperAccountSettingsSideNav.contactDetailsTabTitle" />,
      selected: currentPage === 'ContactDetailsPage',
      id: 'ContactDetailsPageTab',
      linkProps: {
        name: 'ContactDetailsPage',
      },
    },
    {
      text: <FormattedMessage id="LayoutWrapperAccountSettingsSideNav.passwordTabTitle" />,
      selected: currentPage === 'PasswordChangePage',
      id: 'PasswordChangePageTab',
      linkProps: {
        name: 'PasswordChangePage',
      },
    },
    ...payoutDetailsMaybe,
    ...paymentMethodsMaybe,
    {
      text: <FormattedMessage id="LayoutWrapperAccountSettingsSideNav.manageAccountTabTitle" />,
      selected: currentPage === 'ManageAccountPage',
      id: 'ManageAccountPageTab',
      linkProps: {
        name: 'ManageAccountPage',
      },
    },
  ];

  // FAIRWAY: app-style pills with an icon each — a row you swipe on a phone,
  // a list on a desktop — and a dot on the pages that still need something.
  const attention = pagesNeedingAttention(accountSettingsNavProps.currentUser);

  return (
    <nav className={css.accountNav} aria-label={ariaLabel}>
      {tabs.map(tab => {
        const page = tab.linkProps.name;
        return (
          <div key={tab.id} id={tab.id} className={css.accountNavItem}>
            <NamedLink
              {...tab.linkProps}
              className={classNames(css.accountNavLink, {
                [css.accountNavLinkSelected]: tab.selected,
              })}
              aria-current={tab.selected ? 'page' : undefined}
            >
              <NavIcon page={page} />
              <span className={css.accountNavText}>{tab.text}</span>
              {attention[page] ? (
                <span className={css.attentionDot}>
                  <span className={css.srOnly}>
                    <FormattedMessage id="LayoutWrapperAccountSettingsSideNav.needsAttention" />
                  </span>
                </span>
              ) : null}
            </NamedLink>
          </div>
        );
      })}
    </nav>
  );
};

export default LayoutWrapperAccountSettingsSideNav;
