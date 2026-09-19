import React from 'react';

import { FormattedMessage } from '../../util/reactIntl';
import { NamedLink } from '../../components';

import css from './ListingPage.module.css';

/**
 * Golf / Driver / Titleist GT3 — the path back out of a listing.
 *
 * The category link carries the same query the topbar nav uses, so a buyer who
 * clicks "Driver" lands on the same filtered search they would have got from
 * the menu.
 */
const SectionBreadcrumb = props => {
  const { publicData, categoryConfiguration, title } = props;

  const { key: categoryPrefix, categories = [] } = categoryConfiguration || {};
  const categoryId = publicData?.[`${categoryPrefix}1`];
  const category = categories.find(c => c.id === categoryId);

  return (
    <nav className={css.breadcrumb} aria-label="Brødkrumme">
      <ol className={css.breadcrumbList}>
        <li>
          <NamedLink name="SearchPage" className={css.breadcrumbLink}>
            <FormattedMessage id="ListingPage.breadcrumbRoot" />
          </NamedLink>
        </li>

        {category ? (
          <li>
            <NamedLink
              name="SearchPage"
              to={{ search: `?pub_${categoryPrefix}1=${category.id}` }}
              className={css.breadcrumbLink}
            >
              {category.name}
            </NamedLink>
          </li>
        ) : null}

        {title ? (
          <li>
            <span className={css.breadcrumbCurrent} aria-current="page">
              {title}
            </span>
          </li>
        ) : null}
      </ol>
    </nav>
  );
};

export default SectionBreadcrumb;
