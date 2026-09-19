import React from 'react';

import { FormattedMessage } from '../../util/reactIntl';
import { isFieldForCategory, isFieldForListingType } from '../../util/fieldHelpers';

import { Heading } from '../../components';

import css from './ListingPage.module.css';

/**
 * One specification table for everything the seller filled in — category, brand,
 * model, condition and whatever the category adds on top (hand, flex, loft,
 * shaft).
 *
 * The template's own CustomListingFields splits this: enums become a details
 * list and every text field becomes its own paragraph section. A buyer
 * comparing two wedges wants one table, so this renders them together and in
 * the order the fields are declared in configListing.js.
 *
 * Metadata fields are never shown: they belong to the shipping automation.
 */
const labelFor = fieldConfig =>
  fieldConfig.showConfig?.label || fieldConfig.saveConfig?.label || fieldConfig.key;

const valueFor = (fieldConfig, raw) => {
  const { schemaType, enumOptions } = fieldConfig;

  if (schemaType === 'enum') {
    return enumOptions?.find(o => `${o.option}` === `${raw}`)?.label || null;
  }
  if (schemaType === 'multi-enum') {
    const chosen = Array.isArray(raw) ? raw : [];
    const labels = chosen
      .map(v => enumOptions?.find(o => `${o.option}` === `${v}`)?.label)
      .filter(Boolean);
    return labels.length > 0 ? labels.join(', ') : null;
  }
  if (schemaType === 'boolean') {
    return raw === true ? 'Ja' : raw === false ? 'Nej' : null;
  }
  return raw === '' || raw == null ? null : `${raw}`;
};

const SectionSpecs = props => {
  const { publicData, listingFieldConfigs = [], categoryConfiguration } = props;

  if (!publicData) {
    return null;
  }

  const { key: categoryPrefix, categories = [] } = categoryConfiguration || {};
  const categoryId = publicData[`${categoryPrefix}1`];
  const categoryName = categories.find(c => c.id === categoryId)?.name;

  const categoryRowMaybe = categoryName
    ? [{ key: 'category', label: 'Kategori', value: categoryName }]
    : [];

  const fieldRows = listingFieldConfigs
    .filter(fieldConfig => fieldConfig.scope === 'public')
    .filter(fieldConfig => fieldConfig.showConfig?.displayOnListingPage !== false)
    .filter(fieldConfig => isFieldForListingType(publicData.listingType, fieldConfig))
    .filter(fieldConfig => isFieldForCategory([categoryId], fieldConfig))
    .map(fieldConfig => {
      const value = valueFor(fieldConfig, publicData[fieldConfig.key]);
      return value ? { key: fieldConfig.key, label: labelFor(fieldConfig), value } : null;
    })
    .filter(Boolean);

  const rows = [...categoryRowMaybe, ...fieldRows];

  if (rows.length === 0) {
    return null;
  }

  return (
    <section className={css.specs}>
      <Heading as="h2" rootClassName={css.specsHeading}>
        <FormattedMessage id="ListingPage.specsTitle" />
      </Heading>

      <dl className={css.specsList}>
        {rows.map(row => (
          <div key={row.key} className={css.specsRow}>
            <dt className={css.specsLabel}>{row.label}</dt>
            <dd className={css.specsValue}>{row.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
};

export default SectionSpecs;
