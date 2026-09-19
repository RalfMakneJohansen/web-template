import React, { useCallback, useState } from 'react';
import { useDispatch } from 'react-redux';

import { manageDisableScrolling } from '../../ducks/ui.duck';
import { Modal, NamedLink } from '../../components';

import g430Hybrid from '../../assets/klubber/g430-hybrid.jpg';
import gt280Fairway from '../../assets/klubber/gt280-fairway.jpg';
import gt3Driver from '../../assets/klubber/gt3-driver.jpg';
import putter from '../../assets/klubber/putter.jpg';
import quantumDriver from '../../assets/klubber/quantum-driver.jpg';
import vokeyWedges from '../../assets/klubber/vokey-wedges.jpg';

import css from './LandingPage.module.css';

/**
 * A preview of the clubs going up first, so the page has real equipment on it
 * before the marketplace opens. These are not live listings: the detail view
 * gates buying and messaging behind signup, the way a real listing would.
 *
 * Delete this section once listings exist — ListingRow takes over on its own.
 * Prices and conditions are placeholders for the seller to set.
 */
const ITEMS = [
  {
    id: 'gt3',
    image: gt3Driver,
    brand: 'Titleist',
    title: 'GT3 Driver',
    meta: '9° · Stiff',
    price: '3.200 kr',
    condition: 'God',
    description:
      'Spillet to sæsoner. Sålen har normale brugsspor, slagfladen er ren. Leveres med headcover.',
  },
  {
    id: 'quantum',
    image: quantumDriver,
    brand: 'Callaway',
    title: 'Elyte Quantum Driver',
    meta: 'Tri-Force · Stiff',
    price: '3.600 kr',
    condition: 'Som ny',
    description: 'Næsten ubrugt. Ingen mærker på sål eller krone. Headcover og nøgle følger med.',
  },
  {
    id: 'gt280',
    image: gt280Fairway,
    brand: 'Titleist',
    title: 'GT280 Fairway',
    meta: '13° · Stiff',
    price: '2.200 kr',
    condition: 'God',
    description: 'Justerbar hosel. Lette brugsspor på sålen, ellers i fin stand.',
  },
  {
    id: 'g430',
    image: g430Hybrid,
    brand: 'PING',
    title: 'G430 MAX Hybrid',
    meta: '7 · 21°',
    price: '1.400 kr',
    condition: 'God',
    description: 'God erstatning for et langt jern. Skaft og greb er i orden.',
  },
  {
    id: 'vokey',
    image: vokeyWedges,
    brand: 'Titleist',
    title: 'Vokey SM — 56° og 60°',
    meta: 'Sæt · 08M grind',
    price: '1.600 kr',
    condition: 'Okay',
    description:
      'Sælges samlet. Rillerne har slid efter en del runder, men griber stadig. Pris afspejler standen.',
  },
  {
    id: 'aione',
    image: putter,
    brand: 'Odyssey',
    title: 'Ai-ONE Cruiser Putter',
    meta: 'Mallet · Standard længde',
    price: '1.300 kr',
    condition: 'God',
    description: 'Ai-ONE indsats. Enkelte mærker på sålen fra opbevaring, rullen er upåvirket.',
  },
];

const conditionClass = condition =>
  ({
    'Som ny': css.showcaseSomNy,
    God: css.showcaseGod,
    Okay: css.showcaseOkay,
    Slidt: css.showcaseSlidt,
  }[condition]);

const FirstListings = () => {
  const [openItem, setOpenItem] = useState(null);
  const dispatch = useDispatch();

  const onManageDisableScrolling = useCallback(
    (componentId, disableScrolling) =>
      dispatch(manageDisableScrolling(componentId, disableScrolling)),
    [dispatch]
  );

  return (
    <section className={css.showcase}>
      <div className={css.showcaseFrame}>
        <div className={css.showcaseHeader}>
          <div>
            <span className={css.eyebrow}>Netop sat til salg</span>
            <h2 className={css.showcaseTitle}>Din første kølle</h2>
          </div>
          <NamedLink name="SignupPage" className={css.showcaseCta}>
            Sælg dine egne
          </NamedLink>
        </div>

        <ul className={css.showcaseGrid}>
          {ITEMS.map(item => (
            <li key={item.id} className={css.showcaseItem}>
              <button
                type="button"
                className={css.showcaseButton}
                onClick={() => setOpenItem(item)}
              >
                <span className={css.showcaseImageWrap}>
                  <img
                    className={css.showcaseImage}
                    src={item.image}
                    alt={`${item.brand} ${item.title}`}
                    loading="lazy"
                  />
                  <span className={`${css.showcaseBadge} ${conditionClass(item.condition)}`}>
                    {item.condition}
                  </span>
                  <span className={css.showcaseNew}>Ny</span>
                </span>
                <span className={css.showcaseBrand}>{item.brand}</span>
                <span className={css.showcaseName}>{item.title}</span>
                <span className={css.showcaseMeta}>{item.meta}</span>
                <span className={css.showcasePrice}>{item.price}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      <Modal
        id="FirstListingsModal"
        isOpen={openItem !== null}
        onClose={() => setOpenItem(null)}
        onManageDisableScrolling={onManageDisableScrolling}
        usePortal
      >
        {openItem ? (
          <div className={css.detail}>
            <img
              className={css.detailImage}
              src={openItem.image}
              alt={`${openItem.brand} ${openItem.title}`}
            />

            <div className={css.detailBody}>
              <span className={`${css.detailBadge} ${conditionClass(openItem.condition)}`}>
                {openItem.condition}
              </span>
              <span className={css.showcaseBrand}>{openItem.brand}</span>
              <h3 className={css.detailTitle}>{openItem.title}</h3>
              <p className={css.detailMeta}>{openItem.meta}</p>
              <p className={css.detailPrice}>{openItem.price}</p>
              <p className={css.detailText}>{openItem.description}</p>

              <div className={css.detailActions}>
                <NamedLink name="SignupPage" className={css.detailPrimary}>
                  Opret bruger for at købe
                </NamedLink>
                <NamedLink name="LoginPage" className={css.detailSecondary}>
                  Log ind
                </NamedLink>
              </div>

              <p className={css.detailNote}>
                Betalingen holdes sikkert, indtil du har haft 48 timer til at tjekke varen.
              </p>
            </div>
          </div>
        ) : null}
      </Modal>
    </section>
  );
};

export default FirstListings;
