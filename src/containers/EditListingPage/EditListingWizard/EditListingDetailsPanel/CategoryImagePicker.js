import React from 'react';
import { Field } from 'react-final-form';
import classNames from 'classnames';

import { CategoryIcon, DRAWN_CATEGORY_IDS } from '../../../../components';

import css from './CategoryImagePicker.module.css';

/**
 * FAIRWAY: pick the club, not a line in a dropdown.
 *
 * The first thing a seller does was choosing "Driver" from a select — the same
 * control you would use to pick a country, on a marketplace that sells nothing
 * but golf equipment.
 *
 * Laid out the way golf retailers do it: the club in a pale disc with the name
 * under it, small enough that the whole range is one glance. Drawn icons
 * rather than photographs — our own club photos are phone shots on a floor,
 * and a circular crop of one is worse than no picture. An icon is identical
 * at every size and never off-centre.
 *
 * Only used for a flat set of categories. Nested categories still need the
 * select, because a grid of pictures cannot show that something has children.
 */

export const canUseImagePicker = categories =>
  Array.isArray(categories) &&
  categories.length > 0 &&
  categories.every(c => !c.subcategories?.length && DRAWN_CATEGORY_IDS.includes(c.id));

const CategoryImagePicker = props => {
  const { name, categories, onChange, intl } = props;

  return (
    <Field name={name}>
      {({ input, meta }) => {
        const showError = meta.touched && !!meta.error && !input.value;

        return (
          <fieldset className={css.root}>
            <legend className={css.legend}>
              {intl.formatMessage({ id: 'CategoryImagePicker.label' })}
            </legend>

            <div className={css.grid}>
              {categories.map(category => {
                const isSelected = input.value === category.id;
                return (
                  <button
                    key={category.id}
                    type="button"
                    className={classNames(css.card, { [css.cardSelected]: isSelected })}
                    aria-pressed={isSelected}
                    onClick={() => {
                      input.onChange(category.id);
                      input.onBlur();
                      if (onChange) {
                        onChange(category.id);
                      }
                    }}
                  >
                    <span className={css.disc}>
                      <CategoryIcon className={css.icon} category={category.id} />
                    </span>
                    <span className={css.name}>{category.name}</span>
                  </button>
                );
              })}
            </div>

            {showError ? (
              <p className={css.error}>
                {intl.formatMessage({ id: 'CategoryImagePicker.required' })}
              </p>
            ) : null}
          </fieldset>
        );
      }}
    </Field>
  );
};

export default CategoryImagePicker;
