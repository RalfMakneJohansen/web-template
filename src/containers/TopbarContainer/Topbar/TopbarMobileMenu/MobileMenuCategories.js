import React from 'react';

import { FormattedMessage } from '../../../../util/reactIntl';
import { useConfiguration } from '../../../../context/configurationContext';
import { NamedLink } from '../../../../components';

import css from './TopbarMobileMenu.module.css';

/**
 * FAIRWAY: browsing, in the mobile menu.
 *
 * The menu offered an account and nothing else — on a phone it is the main
 * navigation affordance, and opening it to be asked to sign up is a dead end
 * for anyone who only wants to look at wedges.
 *
 * The categories come from the same configuration the topbar nav and the
 * filters use, so this cannot drift out of step with them.
 */
const MobileMenuCategories = props => {
  const { onClose } = props;
  const config = useConfiguration();
  const categories = config.categoryConfiguration?.categories || [];

  if (categories.length === 0) {
    return null;
  }

  return (
    <div className={css.browseSection}>
      <h3 className={css.browseHeading}>
        <FormattedMessage id="TopbarMobileMenu.browseHeading" />
      </h3>

      <ul className={css.browseList}>
        <li>
          <NamedLink className={css.browseLink} name="SearchPage" onClick={onClose}>
            <FormattedMessage id="TopbarMobileMenu.browseAll" />
          </NamedLink>
        </li>
        {categories.map(category => (
          <li key={category.id}>
            <NamedLink
              className={css.browseLink}
              name="SearchPage"
              to={{ search: `?pub_categoryLevel1=${category.id}` }}
              onClick={onClose}
            >
              {category.name}
            </NamedLink>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default MobileMenuCategories;
