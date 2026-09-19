import React from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';

import { useConfiguration } from '../../context/configurationContext';
import { isScrollingDisabled } from '../../ducks/ui.duck';
import { getListingsById } from '../../ducks/marketplaceData.duck';

import { FairwayListingCard, LayoutSingleColumn, NamedLink, Page } from '../../components';
import TopbarContainer from '../TopbarContainer/TopbarContainer';

import boxDriver from '../../assets/box/box-driver.jpg';
import course1 from '../../assets/course/course-1.jpg';
import course2 from '../../assets/course/course-2.jpg';
import course3 from '../../assets/course/course-3.jpg';
import course4 from '../../assets/course/course-4.jpg';
import tileBuy from '../../assets/tiles/tile-buy.jpg';
import tileSell from '../../assets/tiles/tile-sell.jpg';


import FairwayFooter from './FairwayFooter';
import BoxWalkthrough from './BoxWalkthrough';
import FirstListings from './FirstListings';
import ShippingChoice from './ShippingChoice';
import HeroCollage from './HeroCollage';
import RotatingHeadline from './RotatingHeadline';
import SectionWave from './SectionWave';

import css from './LandingPage.module.css';

// Brands and the models people actually search for, per category. These link
// into the keyword search, so they work without any Console setup.
const CATEGORY_PICKS = [
  {
    id: 'driver',
    label: 'Driver',
    brands: ['TaylorMade Qi10', 'Callaway Paradym', 'Titleist GT', 'PING G440', 'Cobra Darkspeed'],
  },
  {
    id: 'jernsaet',
    label: 'Jernsæt',
    brands: ['Mizuno JPX', 'Titleist T-serien', 'PING i230', 'Callaway Apex', 'Srixon ZX'],
  },
  {
    id: 'wedge',
    label: 'Wedge',
    brands: ['Titleist Vokey', 'Cleveland RTX', 'Callaway Jaws', 'PING Glide', 'TaylorMade MG'],
  },
  {
    id: 'putter',
    label: 'Putter',
    brands: ['Scotty Cameron', 'Odyssey Ai-ONE', 'TaylorMade Spider', 'PING Anser', 'L.A.B.'],
  },
  {
    id: 'bag',
    label: 'Bags og tilbehør',
    brands: ['Titleist Players', 'Sun Mountain', 'Vessel', 'PING Hoofer', 'Ogio'],
  },
  {
    id: 'sko',
    label: 'Sko',
    brands: ['FootJoy Pro SLX', 'ECCO Biom', 'adidas Tour360', 'Nike Air Zoom', 'Under Armour'],
  },
];

// Why this exists. Three problems, named plainly.
const COMMUNITY_POINTS = [
  {
    title: 'Kassen',
    text: 'Ingen har en kasse, der passer til en driver. Nu sender vi den.',
  },
  {
    title: 'Prisen',
    text: 'Forhandleren giver dig for lidt, når du indleverer.',
  },
  {
    title: 'Risikoen',
    text: 'På sociale medier sender du penge til en fremmed og håber.',
  },
];

// Illustrative exchange for the chat graphic — not a real conversation.
const THREAD = [
  { from: 'buyer', text: 'Kan du sende til Jylland? Jeg bor ikke i København.' },
  { from: 'seller', text: 'Ja, det kan jeg godt.' },
];

// Buyer protection in the plainest words we have. The same three lines run on
// the listing page, so a buyer meets one promise rather than three wordings.
const TRUST_ITEMS = [
  'Pengene holdes hos Fairway',
  'Forsikret fragt til døren',
  '48 timer til at godkende',
];

const COURSE_IMAGES = [course1, course2, course3, course4];

// The whole trade, from listing to payout, with Fairway in the middle.

// How the three realistic routes compare. Written to be fair to all three:
// dealers really do offer security and returns, and an open marketplace is not
// fraud — it just leaves both parties unprotected.
const COMPARE_WAYS = [
  { id: 'group', label: 'Opslagsgrupper' },
  { id: 'dealer', label: 'Forhandler' },
  { id: 'fairway', label: 'Fairway', own: true },
];

const COMPARE_ROWS = [
  {
    label: 'Som sælger får du',
    group: 'Din pris — men du står alene',
    dealer: 'Mindre, de skal tjene ved videresalg',
    fairway: 'Din pris, uden mellemhandel',
  },
  {
    label: 'Som køber betaler du',
    group: 'Det I aftaler',
    dealer: 'Butikspris',
    fairway: 'Brugtpris, uden butiksavance',
  },
  {
    label: 'Pengene undervejs',
    group: 'Du overfører direkte til en fremmed',
    dealer: 'Sikret',
    fairway: 'Holdes hos os, til varen er godkendt',
  },
  {
    label: 'Hvis varen aldrig kommer',
    group: 'Du kan nå at betale uden at få noget',
    dealer: 'Du får den udleveret eller sendt',
    fairway: 'Pengene har aldrig forladt os — du får dem retur',
  },
  {
    label: 'Hvis varen ikke passer',
    group: 'Jeres egen sag',
    dealer: 'Returret',
    fairway: '48 timer til at sige fra — så går pengene retur',
  },
  {
    label: 'Fragten',
    group: 'I finder selv ud af kasse og porto',
    dealer: 'De kan sende — men fragten er ikke betalt',
    fairway: 'Kasse og label betalt',
  },
];

// The four numbers that answer "what does this cost me?" at a glance.
// The same trade, stated from each side. The seller figure is a comparative
// The same trade from each side, in as few words as it takes.
const SIDES = [
  {
    who: 'Sælger',
    title: 'Markant højere pris',
    text: 'end du får ved indlevering til en forhandler.',
    note: 'Gratis kasse leveret, når du har solgt.',
  },
  {
    who: 'Køber',
    title: 'Sikkert køb',
    text: 'Vi holder pengene, til du har godkendt varen.',
    note: 'God pris på brugt udstyr.',
  },
];

const ArrowIcon = () => (
  <svg
    className={css.arrow}
    width="16"
    height="16"
    viewBox="0 0 16 16"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    fill="none"
    aria-hidden={true}
  >
    <path d="M3 8h9.5" />
    <path d="m9 4.5 3.5 3.5L9 11.5" />
  </svg>
);

const ListingRow = props => {
  const { title, subtitle, searchParams, listings = [] } = props;
  const seeAllTo = searchParams ? { search: searchParams } : {};

  if (listings.length === 0) {
    return null;
  }

  return (
    <section className={css.row}>
      <div className={css.rowHeader}>
        <div>
          <h2 className={css.rowTitle}>{title}</h2>
          {subtitle ? <p className={css.rowSubtitle}>{subtitle}</p> : null}
        </div>
        <NamedLink name="SearchPage" to={seeAllTo} className={css.seeAll}>
          Se alle
        </NamedLink>
      </div>

      <ul className={css.productRow}>
        {listings.map(listing => (
          <li key={listing.id.uuid} className={css.productItem}>
            <FairwayListingCard
              listing={listing}
              renderSizes="(max-width: 767px) 45vw, (max-width: 1023px) 30vw, 20vw"
            />
          </li>
        ))}
      </ul>
    </section>
  );
};

export const LandingPageComponent = props => {
  const config = useConfiguration();
  // listings is undefined until the fetch resolves — and the front page must
  // never be the thing that crashes.
  const { listings = [], fetchError, scrollingDisabled } = props;

  const marketplaceName = config.marketplaceName;
  const title = `${marketplaceName} – køb og sælg brugt golfudstyr trygt`;
  const description =
    'Fairway er markedspladsen for brugt golfudstyr i Danmark. Escrow-beskyttet betaling, forsikret fragt og 48 timers inspektion.';

  const hasListings = listings.length > 0;

  return (
    <Page title={title} description={description} scrollingDisabled={scrollingDisabled}>
      <LayoutSingleColumn topbar={<TopbarContainer />} footer={<FairwayFooter />}>
        <section className={css.hero}>
          <div className={css.heroPanel}>
            <span className={css.eyebrowOnDark}>Brugt golfudstyr · Danmark</span>
            <RotatingHeadline />
            <p className={css.heroText}>
              {/* The seller pays neither box nor freight — the buyer pays a flat
                  50 kr. Only our 10% comes off the sale. */}
              Vi sender kassen direkte til dig — du betaler først noget, når den er solgt.
            </p>
            <div className={css.heroActions}>
              <NamedLink name="NewListingPage" className={css.buttonPrimary}>
                Sælg dit udstyr
              </NamedLink>
              <NamedLink name="SearchPage" className={css.buttonGhost}>
                Se annoncer
              </NamedLink>
            </div>
          </div>
          <div className={css.heroMedia}>
            <HeroCollage />

            {/* a single loose stroke for movement — decoration only */}
            <svg className={css.heroStroke} viewBox="0 0 420 300" fill="none" aria-hidden={true}>
              <path d="M-10 268c70-22 96-58 168-56 54 2 78 34 132 20 38-10 62-34 140-40" />
            </svg>
          </div>
        </section>

        <div className={css.trustBar}>
          <div className={css.trustBarInner}>
            <span className={css.trustBarLabel}>Tryghed er indbygget</span>
            <ul className={css.trustBarList}>
              {TRUST_ITEMS.map(item => (
                <li key={item} className={css.trustBarItem}>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <SectionWave position="bottom" />
        </div>

        {/* Two lines: what each side gets. Then the three ways in. */}
        <section className={css.offer}>
          <div className={css.offerInner}>
            <p className={css.offerLine}>
              <span className={css.offerWho}>Sælger du</span>
              vi sender dig en kasse
            </p>
            <p className={css.offerLine}>
              <span className={css.offerWho}>Køber du</span>
              vi sikrer dig med køberbeskyttelse
            </p>
          </div>
        </section>

        <section className={css.tiles}>
          <NamedLink name="SearchPage" className={css.tile}>
            <img className={css.tileImage} src={tileBuy} alt="" />
            <span className={css.tileScrim} />
            <span className={css.tileContent}>
              <span className={css.tileLabel}>Køb</span>
              <span className={css.tileTitle}>Se udstyr</span>
              <span className={css.tileText}>Brugt udstyr fra andre golfspillere.</span>
              <span className={css.tileButton}>
                Se annoncer
                <ArrowIcon />
              </span>
            </span>
          </NamedLink>

          <NamedLink name="NewListingPage" className={css.tile}>
            <img className={css.tileImage} src={boxDriver} alt="" />
            <span className={css.tileScrim} />
            <span className={css.tileContent}>
              <span className={css.tileLabel}>Sælg</span>
              <span className={css.tileTitle}>Opret annonce</span>
              <span className={css.tileText}>Få en gratis kasse, når du har solgt.</span>
              <span className={css.tileButton}>
                Opret annonce
                <ArrowIcon />
              </span>
            </span>
          </NamedLink>

          <NamedLink name="SignupPage" className={css.tile}>
            <img className={css.tileImage} src={tileSell} alt="" />
            <span className={css.tileScrim} />
            <span className={css.tileContent}>
              <span className={css.tileLabel}>Kom i gang</span>
              <span className={css.tileTitle}>Opret bruger</span>
              <span className={css.tileText}>Gratis. Tager under et minut.</span>
              <span className={css.tileButton}>
                Opret bruger
                <ArrowIcon />
              </span>
            </span>
          </NamedLink>
        </section>

        <div className={css.content}>
          {fetchError ? (
            <p className={css.errorState}>
              Vi kunne ikke hente annoncerne lige nu. Prøv at genindlæse siden.
            </p>
          ) : null}

          {hasListings ? (
            <>
              <ListingRow title="Lige lagt op" listings={listings.slice(0, 5)} />
              <ListingRow
                title="Køller"
                subtitle="Drivere, jern og wedges fra andre golfspillere."
                searchParams="?pub_categoryLevel1=driver"
                listings={listings.slice(5, 10)}
              />
            </>
          ) : (
            <FirstListings />
          )}
        </div>

        <section className={css.community}>
          <SectionWave position="top" />
          <div className={css.communityInner}>
            <div className={css.communityCopy}>
              <span className={css.eyebrowOnDark}>Hvorfor vi startede</span>
              <h2 className={css.communityTitle}>Vi var trætte af tre ting</h2>

              <dl className={css.communityPoints}>
                {COMMUNITY_POINTS.map(point => (
                  <div key={point.title} className={css.communityPoint}>
                    <dt className={css.communityPointTitle}>{point.title}</dt>
                    <dd className={css.communityPointText}>{point.text}</dd>
                  </div>
                ))}
              </dl>

              <div className={css.communityActions}>
                <NamedLink name="SignupPage" className={css.buttonPrimary}>
                  Opret bruger
                  <ArrowIcon />
                </NamedLink>
                <NamedLink name="SearchPage" className={css.buttonGhost}>
                  Se annoncer
                </NamedLink>
              </div>
            </div>

            {/* Illustration of the in-listing chat, not a real conversation */}
            <div className={css.thread} aria-hidden={true}>
              <div className={css.threadHead}>
                <span className={css.threadHeadCopy}>
                  <span className={css.threadHeadTitle}>Elyte Quantum Driver</span>
                  <span className={css.threadHeadMeta}>Samtalen ligger i annoncen</span>
                </span>
              </div>

              <ul className={css.threadList}>
                {THREAD.map((msg, index) => (
                  <li
                    key={index}
                    className={msg.from === 'buyer' ? css.msgBuyer : css.msgSeller}
                  >
                    <span className={css.msgBubble}>{msg.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <SectionWave position="bottom" />
        </section>

        {/* Our own box, photographed. The copy stays out of the way of it. */}
        <section className={css.box}>
          <div className={css.boxInner}>
            <div className={css.boxPanel}>
              <span className={css.eyebrowOnDark}>Fragten</span>
              <h2 className={css.boxTitle}>Vi sender kassen</h2>
              <p className={css.boxLead}>
                Driver, jernsæt eller bag — vi har kassen, og du betaler ikke for at sende den.
              </p>

              <ShippingChoice />
            </div>

            <BoxWalkthrough />
          </div>
        </section>

        <section className={css.fee}>
          <SectionWave position="top" />
          <div className={css.feeInner}>
            <span className={css.eyebrowOnDark}>Hvorfor Fairway</span>
            <h2 className={css.feeTitle}>Begge sider vinder</h2>

            <div className={css.sides}>
              {SIDES.map(side => (
                <div key={side.who} className={css.side}>
                  <span className={css.sideWho}>{side.who}</span>
                  <h3 className={css.sideTitle}>{side.title}</h3>
                  <p className={css.sideText}>{side.text}</p>
                  <p className={css.sideNote}>{side.note}</p>
                </div>
              ))}
            </div>

            <p className={css.feeFine}>
              Vores fee er 10% af salget og betales af køber.
            </p>
          </div>
        </section>

        <section className={css.sellBanner}>
          <div className={css.courseStrip} aria-hidden={true}>
            {COURSE_IMAGES.map(src => (
              <div key={src} className={css.coursePanel}>
                <img className={css.courseImage} src={src} alt="" loading="lazy" />
              </div>
            ))}
          </div>

          <div className={css.sellBannerInner}>
            <h2 className={css.sellTitle}>Klar til at sælge?</h2>
            <p className={css.sellText}>
              Kassen er på vej, så snart din vare er solgt. Du skal bare pakke den.
            </p>
            <div className={css.sellActions}>
              <NamedLink name="SignupPage" className={css.buttonPrimary}>
                Sælg dit udstyr
                <ArrowIcon />
              </NamedLink>
              <NamedLink name="SearchPage" className={css.buttonGhost}>
                Se annoncer
              </NamedLink>
            </div>
          </div>
        </section>
      </LayoutSingleColumn>
    </Page>
  );
};

const mapStateToProps = state => {
  const { newestListingIds, fetchInProgress, fetchError } = state.LandingPage;

  return {
    listings: getListingsById(state, newestListingIds),
    fetchInProgress,
    fetchError,
    scrollingDisabled: isScrollingDisabled(state),
  };
};

const LandingPage = compose(connect(mapStateToProps))(LandingPageComponent);

export default LandingPage;
