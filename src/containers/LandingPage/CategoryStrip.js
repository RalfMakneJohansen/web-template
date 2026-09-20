import React from 'react';

import { useConfiguration } from '../../context/configurationContext';
import { CategoryIcon, NamedLink } from '../../components';

import css from './CategoryStrip.module.css';

/**
 * FAIRWAY: the range, as discs, on the front page.
 *
 * Fills the space the listings will eventually take with something that is
 * both true and useful: every category, one tap away. It is the same disc
 * treatment as the wizard's category picker and reads from the same picture
 * map, so listing a driver and shopping for one look like the same shop.
 *
 * Unlike a row of products it stays correct forever — it needs no inventory,
 * and it does not have to pretend anything has been sold.
 */
const CategoryStrip = () => {
  const config = useConfiguration();
  const categories = config.categoryConfiguration?.categories || [];

  if (categories.length === 0) {
    return null;
  }

  return (
    <section className={css.root}>
      <div className={css.head}>
        <h2 className={css.title}>Find det du leder efter</h2>
        <NamedLink name="SearchPage" className={css.all}>
          Se alt udstyr
        </NamedLink>
      </div>

      <ul className={css.strip}>
        {categories.map(category => (
          <li key={category.id} className={css.item}>
            <NamedLink
              name="SearchPage"
              to={{ search: `?pub_categoryLevel1=${category.id}` }}
              className={css.link}
            >
              <span className={css.disc}>
                <CategoryIcon className={css.icon} category={category.id} />
              </span>
              <span className={css.name}>{category.name}</span>
            </NamedLink>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default CategoryStrip;
