import React from 'react';

import { FormattedMessage } from '../../../../util/reactIntl';
import { useConfiguration } from '../../../../context/configurationContext';
import { NamedLink } from '../../../../components';

import css from './TopbarMobileMenu.module.css';

/**
 * FAIRWAY: browsing, in the mobile menu — the categories as chips.
 *
 * The categories come from the same configuration the topbar nav and the
 * filters use, so this cannot drift out of step with them.
 */
const MobileMenuCategories = () => {
  const config = useConfiguration();
  const categories = config.categoryConfiguration?.categories || [];

  if (categories.length === 0) {
    return null;
  }

  return (
    <section className={css.categories} aria-labelledby="mobile-menu-categories">
      <h3 id="mobile-menu-categories" className={css.sectionHeading}>
        <FormattedMessage id="TopbarMobileMenu.browseHeading" />
      </h3>
      <ul className={css.chips}>
        {categories.map(category => (
          <li key={category.id}>
            <NamedLink
              className={css.chip}
              name="SearchPage"
              to={{ search: `?pub_categoryLevel1=${category.id}` }}
            >
              {category.name}
            </NamedLink>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default MobileMenuCategories;
