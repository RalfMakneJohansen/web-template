import React from 'react';
import { Field } from 'react-final-form';
import classNames from 'classnames';

import andet from '../../../../assets/categories/andet.jpg';
import bag from '../../../../assets/categories/bag.jpg';
import driver from '../../../../assets/categories/driver.jpg';
import fairwayWood from '../../../../assets/categories/fairway-wood.jpg';
import hybrid from '../../../../assets/categories/hybrid.jpg';
import jernsaet from '../../../../assets/categories/jernsaet.jpg';
import putter from '../../../../assets/categories/putter.jpg';
import sko from '../../../../assets/categories/sko.jpg';
import wedge from '../../../../assets/categories/wedge.jpg';

import css from './CategoryImagePicker.module.css';

/**
 * FAIRWAY: pick the club, not a line in a dropdown.
 *
 * The first thing a seller does was choosing "Driver" from a select — the same
 * control you would use to pick a country. For a marketplace that only sells
 * golf equipment, that throws away the one thing that makes the step
 * unmistakable: you can show the thing.
 *
 * The photographs were already in the repo, one per category, named after the
 * category ids, and nothing was using them.
 *
 * Only used for a flat set of categories. Nested categories still need the
 * select, because a grid of pictures cannot show that something has children.
 */
const IMAGES = {
  driver,
  'fairway-wood': fairwayWood,
  hybrid,
  jernsaet,
  wedge,
  putter,
  bag,
  sko,
  andet,
};

export const canUseImagePicker = categories =>
  Array.isArray(categories) &&
  categories.length > 0 &&
  categories.every(c => !c.subcategories?.length && IMAGES[c.id]);

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
                    <span className={css.imageWrap}>
                      <img className={css.image} src={IMAGES[category.id]} alt="" />
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
