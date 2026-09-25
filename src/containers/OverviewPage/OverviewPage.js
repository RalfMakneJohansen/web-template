import React from 'react';
import { useSelector } from 'react-redux';
import classNames from 'classnames';

// Import configs and util modules
import { FormattedMessage, useIntl } from '../../util/reactIntl';
import { formatMoney } from '../../util/currency';
import { ensureCurrentUser, userDisplayNameAsString } from '../../util/data';
import {
  createSlug,
  LISTING_PAGE_PARAM_TYPE_DRAFT,
  LISTING_PAGE_PARAM_TYPE_EDIT,
} from '../../util/urlHelpers';
import { getTradeReadiness } from '../../util/fairwayContact';
import { shipmentFrom } from '../../util/fairwayTracking';
import { showCreateListingLinkForUser } from '../../util/userHelpers';
import { useConfiguration } from '../../context/configurationContext';
import { getMarketplaceEntities } from '../../ducks/marketplaceData.duck';
import { isScrollingDisabled } from '../../ducks/ui.duck';

// Import shared components
import {
  AvatarLarge,
  LayoutSingleColumn,
  NamedLink,
  Page,
  ResponsiveImage,
  TradeReadiness,
  UserNav,
} from '../../components';

import TopbarContainer from '../TopbarContainer/TopbarContainer';
import FooterContainer from '../FooterContainer/FooterContainer';

import { actionItems, overviewStats, recentTrades, timeLeft, tradeStatus } from './overviewData';
import css from './OverviewPage.module.css';

const IMAGE_VARIANTS = ['listing-card', 'listing-card-2x'];

const Thumb = ({ listing, className }) => {
  const image = listing?.images?.[0];
  return (
    <span className={classNames(css.thumb, className)}>
      {image ? (
        <ResponsiveImage
          rootClassName={css.thumbImage}
          alt=""
          image={image}
          variants={IMAGE_VARIANTS}
          sizes="96px"
        />
      ) : null}
    </span>
  );
};

const txLinkProps = (tx, role) => ({
  name: role === 'provider' ? 'SaleDetailsPage' : 'OrderDetailsPage',
  params: { id: tx.id.uuid },
});

const Deadline = ({ deadline }) => {
  if (!deadline) {
    return null;
  }
  const { unit, value } = timeLeft(deadline);
  return (
    <span className={classNames(css.deadline, { [css.deadlineUrgent]: unit !== 'days' })}>
      <FormattedMessage id={`OverviewPage.timeLeft.${unit}`} values={{ count: value }} />
    </span>
  );
};

// One thing to do (or to follow) on a trade.
const ActionCard = ({ item }) => {
  const { kind, role, tx, deadline } = item;
  const listing = tx.listing;
  const other = role === 'provider' ? tx.customer : tx.provider;
  const otherName = userDisplayNameAsString(other, '');
  const shipment = kind === 'onItsWay' ? shipmentFrom(tx.attributes.metadata) : null;
  const mustAct = kind === 'send' || kind === 'approve';

  return (
    <li>
      <NamedLink
        {...txLinkProps(tx, role)}
        className={classNames(css.actionCard, { [css.actionCardMust]: mustAct })}
      >
        <Thumb listing={listing} />
        <span className={css.actionBody}>
          <span className={css.actionKind}>
            <FormattedMessage id={`OverviewPage.action.${kind}.title`} />
          </span>
          <span className={css.actionTitle}>{listing?.attributes?.title}</span>
          <span className={css.actionText}>
            <FormattedMessage
              id={`OverviewPage.action.${kind}.text`}
              values={{ name: otherName }}
            />
            {shipment?.carrierName ? ` · ${shipment.carrierName}` : ''}
          </span>
        </span>
        <span className={css.actionSide}>
          <Deadline deadline={deadline} />
          <span className={css.actionCta}>
            <FormattedMessage id={`OverviewPage.action.${kind}.cta`} />
            <span aria-hidden={true}>→</span>
          </span>
        </span>
      </NamedLink>
    </li>
  );
};

const listingLinkProps = listing => {
  const { title, state } = listing.attributes;
  const id = listing.id.uuid;
  const slug = createSlug(title || 'annonce');
  if (state === 'published') {
    return { name: 'ListingPage', params: { id, slug } };
  }
  return {
    name: 'EditListingPage',
    params: {
      id,
      slug,
      type: state === 'draft' ? LISTING_PAGE_PARAM_TYPE_DRAFT : LISTING_PAGE_PARAM_TYPE_EDIT,
      tab: 'details',
    },
  };
};

const ListingTile = ({ listing, intl, hideStatus = false }) => {
  const { title, price, state } = listing.attributes;
  const status = ['published', 'draft', 'closed', 'pendingApproval'].includes(state)
    ? state
    : 'published';
  return (
    <li>
      <NamedLink {...listingLinkProps(listing)} className={css.listingTile}>
        <span className={css.listingImageWrap}>
          <Thumb listing={listing} className={css.listingThumb} />
          {hideStatus ? null : (
            <span className={classNames(css.status, css[`status_${status}`])}>
              <FormattedMessage id={`OverviewPage.listingStatus.${status}`} />
            </span>
          )}
        </span>
        <span className={css.listingTitle}>{title}</span>
        {price ? <span className={css.listingPrice}>{formatMoney(intl, price)}</span> : null}
      </NamedLink>
    </li>
  );
};

/**
 * FAIRWAY: "Min side" — everything about you as a buyer and seller on one page.
 *
 * What needs doing now (with the deadline), your numbers, your listings and
 * your latest trades, and — until you're set up to sell — what is missing.
 *
 * @component
 * @returns {JSX.Element}
 */
const OverviewPage = () => {
  const intl = useIntl();
  const config = useConfiguration();
  const scrollingDisabled = useSelector(isScrollingDisabled);
  const currentUser = useSelector(state => state.user?.currentUser);
  const {
    listingRefs,
    listingCount,
    saleRefs,
    orderRefs,
    favoriteRefs = [],
    loadError,
  } = useSelector(state => state.OverviewPage);
  const listings = useSelector(state => getMarketplaceEntities(state, listingRefs));
  const sales = useSelector(state => getMarketplaceEntities(state, saleRefs));
  const orders = useSelector(state => getMarketplaceEntities(state, orderRefs));
  const favorites = useSelector(state => getMarketplaceEntities(state, favoriteRefs));

  const user = ensureCurrentUser(currentUser);
  const firstName = user.attributes.profile?.firstName || '';
  const createdAt = user.attributes.createdAt;
  const readiness = getTradeReadiness(currentUser);
  const readyCount = ['emailVerified', 'senderAddress', 'payoutAccount'].filter(
    key => readiness[key]
  ).length;
  const canSell = showCreateListingLinkForUser(config, currentUser);

  const actions = actionItems({ sales, orders });
  const stats = overviewStats({ sales, orders, listingCount });
  const recent = recentTrades({ sales, orders });

  const statCards = [
    { key: 'listings', value: stats.listings },
    { key: 'sold', value: stats.sold },
    { key: 'bought', value: stats.bought },
    { key: 'earned', value: stats.earned ? formatMoney(intl, stats.earned) : '0 kr.' },
  ];

  return (
    <Page
      title={intl.formatMessage({ id: 'OverviewPage.title' })}
      scrollingDisabled={scrollingDisabled}
    >
      <LayoutSingleColumn
        topbar={
          <>
            <TopbarContainer />
            <UserNav currentPage="OverviewPage" showManageListingsLink={canSell} />
          </>
        }
        footer={<FooterContainer />}
      >
        <div className={css.root}>
          <header className={css.hero}>
            <div className={css.heroMain}>
              <AvatarLarge className={css.avatar} user={currentUser} disableProfileLink />
              <div className={css.heroCopy}>
                <h1 className={css.greeting}>
                  <FormattedMessage id="OverviewPage.greeting" values={{ name: firstName }} />
                </h1>
                {createdAt ? (
                  <p className={css.memberSince}>
                    <FormattedMessage
                      id="OverviewPage.memberSince"
                      values={{
                        date: intl.formatDate(createdAt, { month: 'long', year: 'numeric' }),
                      }}
                    />
                  </p>
                ) : null}
                <ul className={css.badges}>
                  {['emailVerified', 'senderAddress', 'payoutAccount'].map(key => (
                    <li
                      key={key}
                      className={classNames(css.badge, { [css.badgeDone]: readiness[key] })}
                    >
                      <span className={css.badgeDot} aria-hidden={true}>
                        {readiness[key] ? '✓' : ''}
                      </span>
                      <FormattedMessage id={`OverviewPage.badge.${key}`} />
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className={css.heroActions}>
              {user.id ? (
                <NamedLink
                  name="ProfilePage"
                  params={{ id: user.id.uuid }}
                  className={css.heroButtonGhost}
                >
                  <FormattedMessage id="OverviewPage.viewProfile" />
                </NamedLink>
              ) : null}
              <NamedLink name="ProfileSettingsPage" className={css.heroButton}>
                <FormattedMessage id="OverviewPage.editProfile" />
              </NamedLink>
            </div>
          </header>

          <ul className={css.stats}>
            {statCards.map(stat => (
              <li key={stat.key} className={css.stat}>
                <span className={css.statValue}>{stat.value}</span>
                <span className={css.statLabel}>
                  <FormattedMessage id={`OverviewPage.stat.${stat.key}`} />
                </span>
              </li>
            ))}
          </ul>

          {loadError ? (
            <p className={css.error} role="alert">
              <FormattedMessage id="OverviewPage.loadError" />
            </p>
          ) : null}

          <section className={css.section} aria-labelledby="overview-todo">
            <div className={css.sectionHead}>
              <h2 id="overview-todo" className={css.sectionTitle}>
                <FormattedMessage id="OverviewPage.todoTitle" />
              </h2>
              {actions.length > 0 ? <span className={css.count}>{actions.length}</span> : null}
            </div>
            {actions.length > 0 ? (
              <ul className={css.actions}>
                {actions.map(item => (
                  <ActionCard key={`${item.kind}-${item.tx.id.uuid}`} item={item} />
                ))}
              </ul>
            ) : (
              <div className={css.allDone}>
                <span className={css.allDoneMark} aria-hidden={true}>
                  ✓
                </span>
                <span>
                  <strong className={css.allDoneTitle}>
                    <FormattedMessage id="OverviewPage.allDoneTitle" />
                  </strong>
                  <span className={css.allDoneText}>
                    <FormattedMessage id="OverviewPage.allDoneText" />
                  </span>
                </span>
              </div>
            )}
          </section>

          {canSell && !readiness.readyToSell ? (
            <section className={css.section}>
              <TradeReadiness currentUser={currentUser} context="profile" />
              <p className={css.readyHint}>
                <FormattedMessage id="OverviewPage.readyCount" values={{ count: readyCount }} />
              </p>
            </section>
          ) : null}

          <div className={css.columns}>
            {canSell ? (
              <section className={css.section} aria-labelledby="overview-listings">
                <div className={css.sectionHead}>
                  <h2 id="overview-listings" className={css.sectionTitle}>
                    <FormattedMessage id="OverviewPage.listingsTitle" />
                  </h2>
                  {listingCount > 0 ? (
                    <NamedLink name="ManageListingsPage" className={css.sectionLink}>
                      <FormattedMessage id="OverviewPage.seeAll" values={{ count: listingCount }} />
                    </NamedLink>
                  ) : null}
                </div>
                <ul className={css.listingGrid}>
                  {listings.map(listing => (
                    <ListingTile key={listing.id.uuid} listing={listing} intl={intl} />
                  ))}
                  <li>
                    <NamedLink name="NewListingPage" className={css.newListingTile}>
                      <span className={css.plus} aria-hidden={true}>
                        +
                      </span>
                      <FormattedMessage id="OverviewPage.newListing" />
                    </NamedLink>
                  </li>
                </ul>
              </section>
            ) : null}

            <section className={css.section} aria-labelledby="overview-recent">
              <div className={css.sectionHead}>
                <h2 id="overview-recent" className={css.sectionTitle}>
                  <FormattedMessage id="OverviewPage.recentTitle" />
                </h2>
                <NamedLink name="InboxPage" params={{ tab: 'orders' }} className={css.sectionLink}>
                  <FormattedMessage id="OverviewPage.inboxLink" />
                </NamedLink>
              </div>
              {recent.length > 0 ? (
                <ul className={css.recent}>
                  {recent.map(({ tx, role }) => {
                    const status = tradeStatus(tx, role);
                    const price =
                      role === 'provider' ? tx.attributes.payoutTotal : tx.attributes.payinTotal;
                    return (
                      <li key={tx.id.uuid}>
                        <NamedLink {...txLinkProps(tx, role)} className={css.recentRow}>
                          <Thumb listing={tx.listing} className={css.recentThumb} />
                          <span className={css.recentBody}>
                            <span className={css.recentTitle}>{tx.listing?.attributes?.title}</span>
                            <span className={css.recentMeta}>
                              <span className={css.role}>
                                <FormattedMessage id={`OverviewPage.role.${role}`} />
                              </span>
                              <span className={classNames(css.tradeStatus, css[`trade_${status}`])}>
                                <FormattedMessage id={`OverviewPage.tradeStatus.${status}`} />
                              </span>
                            </span>
                          </span>
                          {price ? (
                            <span className={css.recentPrice}>{formatMoney(intl, price)}</span>
                          ) : null}
                        </NamedLink>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <div className={css.empty}>
                  <p className={css.emptyText}>
                    <FormattedMessage id="OverviewPage.noTrades" />
                  </p>
                  <NamedLink name="SearchPage" className={css.emptyLink}>
                    <FormattedMessage id="OverviewPage.browse" />
                  </NamedLink>
                </div>
              )}
            </section>
          </div>

          {favorites.length > 0 ? (
            <section className={css.section} aria-labelledby="overview-saved">
              <div className={css.sectionHead}>
                <h2 id="overview-saved" className={css.sectionTitle}>
                  <FormattedMessage id="OverviewPage.savedTitle" />
                </h2>
              </div>
              <ul className={css.savedGrid}>
                {favorites.map(listing => (
                  <ListingTile key={listing.id.uuid} listing={listing} intl={intl} hideStatus />
                ))}
              </ul>
            </section>
          ) : null}
        </div>
      </LayoutSingleColumn>
    </Page>
  );
};

export default OverviewPage;
