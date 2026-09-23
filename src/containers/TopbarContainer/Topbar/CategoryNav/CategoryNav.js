import React, { useEffect, useRef, useState } from 'react';

import { NamedLink } from '../../../../components';
import { useConfiguration } from '../../../../context/configurationContext';

import css from './CategoryNav.module.css';

/**
 * Persistent category navigation, so the catalogue stays one click away from
 * every page.
 *
 * Leaf ids are passed to the search page as pub_categoryLevel1 and must match
 * the categories configured in Console. A group without children is a plain
 * link; a group with children opens a panel on desktop.
 */
const GROUPS = [
  {
    id: 'koller',
    label: 'Køller',
    children: [
      { id: 'driver', label: 'Driver' },
      { id: 'fairway-wood', label: 'Fairway wood' },
      { id: 'hybrid', label: 'Hybrid' },
      { id: 'jernsaet', label: 'Jernsæt' },
      { id: 'wedge', label: 'Wedge' },
      { id: 'putter', label: 'Putter' },
    ],
  },
  { id: 'bag', label: 'Bags' },
  { id: 'sko', label: 'Sko' },
  { id: 'andet', label: 'Tilbehør' },
];

// Narrow screens get every category as one scrollable row: a dropdown would be
// clipped by the row's own horizontal scrolling.
const LEAVES = GROUPS.flatMap(group => group.children || [group]);

const searchTo = id => ({ search: `?pub_categoryLevel1=${id}` });

// A category narrowed by shaft flex, the way a golfer actually shops: not
// "show me every iron set" but "show me the stiff ones".
const flexSearchTo = (categoryId, flex) => ({
  search: `?pub_categoryLevel1=${categoryId}&pub_shaft_flex=${flex}`,
});

const Chevron = () => (
  <svg className={css.chevron} width="10" height="6" viewBox="0 0 10 6" aria-hidden={true}>
    <path d="m1 1 4 4 4-4" />
  </svg>
);

const CategoryNav = () => {
  const [openId, setOpenId] = useState(null);
  const rootRef = useRef(null);
  const closeTimer = useRef(null);
  const config = useConfiguration();

  /**
   * Shaft flex as the second level of the menu.
   *
   * Narrowing a category by flex is how a golfer shops — not "every iron
   * set" but "the stiff ones" — so the structure is here, built from the
   * field's own options and its own categoryConfig. Five columns, not six:
   * putters have a shaft but nobody shops for putter flex.
   *
   * Known and accepted: the links do not narrow anything yet. Sharetribe
   * cannot filter on a key with no search index, so until
   * `flex-cli search set --key pub_shaft_flex` has been run, "Stiff" returns
   * the same listings as "Regular". This was built gated on indexForSearch
   * for exactly that reason and then deliberately opened up — the structure
   * is worth having in place before the stock arrives, and with three
   * listings in a dev marketplace nobody is being misled at scale. It starts
   * telling the truth the moment the index exists; nothing here changes.
   */
  const flexField = (config.listing.listingFields || []).find(f => f.key === 'shaft_flex');
  const flexOptions = flexField?.enumOptions || [];
  const flexCategoryIds = flexField?.categoryConfig?.categoryIds || [];

  // A short delay lets the pointer cross the gap between button and panel
  const open = id => {
    window.clearTimeout(closeTimer.current);
    setOpenId(id);
  };
  const scheduleClose = () => {
    closeTimer.current = window.setTimeout(() => setOpenId(null), 120);
  };

  useEffect(() => {
    if (openId === null) {
      return;
    }
    const onKeyDown = e => {
      if (e.key === 'Escape') {
        setOpenId(null);
      }
    };
    const onPointerDown = e => {
      if (rootRef.current && !rootRef.current.contains(e.target)) {
        setOpenId(null);
      }
    };
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('mousedown', onPointerDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('mousedown', onPointerDown);
    };
  }, [openId]);

  useEffect(() => () => window.clearTimeout(closeTimer.current), []);

  const allLink = (
    <li className={css.item}>
      <NamedLink name="SearchPage" className={css.link}>
        Alt udstyr
      </NamedLink>
    </li>
  );

  return (
    <nav className={css.root} aria-label="Kategorier" ref={rootRef}>
      <ul className={css.barCompact}>
        {allLink}
        {LEAVES.map(leaf => (
          <li key={leaf.id} className={css.item}>
            <NamedLink name="SearchPage" to={searchTo(leaf.id)} className={css.link}>
              {leaf.label}
            </NamedLink>
          </li>
        ))}
      </ul>

      <ul className={css.bar}>
        {allLink}
        {GROUPS.map(group => {
          if (!group.children) {
            return (
              <li key={group.id} className={css.item}>
                <NamedLink name="SearchPage" to={searchTo(group.id)} className={css.link}>
                  {group.label}
                </NamedLink>
              </li>
            );
          }

          const isOpen = openId === group.id;
          return (
            <li
              key={group.id}
              className={css.item}
              onMouseEnter={() => open(group.id)}
              onMouseLeave={scheduleClose}
            >
              <button
                type="button"
                className={isOpen ? `${css.link} ${css.linkOpen}` : css.link}
                aria-expanded={isOpen}
                onClick={() => setOpenId(isOpen ? null : group.id)}
              >
                {group.label}
                <Chevron />
              </button>

              {isOpen ? (
                <div className={flexOptions.length ? css.panelWide : css.panel}>
                  <ul className={flexOptions.length ? css.panelColumns : css.panelList}>
                    {group.children.map(child => {
                      const childFlex = flexCategoryIds.includes(child.id) ? flexOptions : [];

                      return (
                        <li key={child.id} className={css.panelColumn}>
                          <NamedLink
                            name="SearchPage"
                            to={searchTo(child.id)}
                            className={childFlex.length ? css.panelHeading : css.panelLink}
                            onClick={() => setOpenId(null)}
                          >
                            {child.label}
                          </NamedLink>

                          {childFlex.length ? (
                            <ul className={css.flexList}>
                              {childFlex.map(option => (
                                <li key={option.option}>
                                  <NamedLink
                                    name="SearchPage"
                                    to={flexSearchTo(child.id, option.option)}
                                    className={css.flexLink}
                                    onClick={() => setOpenId(null)}
                                  >
                                    {option.label}
                                  </NamedLink>
                                </li>
                              ))}
                            </ul>
                          ) : null}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ) : null}
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default CategoryNav;
