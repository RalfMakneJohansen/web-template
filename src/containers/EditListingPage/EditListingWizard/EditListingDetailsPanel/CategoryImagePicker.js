import React from 'react';
import { Field } from 'react-final-form';
import classNames from 'classnames';

// Newer models, shot at 700x700 — used wherever we have one for the category.
import elyte3Wood from '../../../../assets/klubber/elyte-3wood.jpg';
import g430Hybrid from '../../../../assets/klubber/g430-hybrid.jpg';
import gt3Driver from '../../../../assets/klubber/gt3-driver.jpg';
import puttershot from '../../../../assets/klubber/putter.jpg';
import vokeyWedges from '../../../../assets/klubber/vokey-wedges.jpg';

// The rest, at 300x300, until there are product shots for them.
import andet from '../../../../assets/categories/andet.jpg';
import bag from '../../../../assets/categories/bag.jpg';
import jernsaet from '../../../../assets/categories/jernsaet.jpg';
import sko from '../../../../assets/categories/sko.jpg';

import css from './CategoryImagePicker.module.css';

/**
 * FAIRWAY: pick the club, not a line in a dropdown.
 *
 * The first thing a seller does was choosing "Driver" from a select — the same
 * control you would use to pick a country, on a marketplace that sells nothing
 * but golf equipment.
 *
 * Laid out the way golf retailers do it: the club in a pale disc with the name
 * under it, small enough that the whole range is one glance. A disc also
 * forgives the photography, because it crops to the head of the club and drops
 * whatever the rest of the frame happened to contain.
 *
 * Only used for a flat set of categories. Nested categories still need the
 * select, because a grid of pictures cannot show that something has children.
 */
const IMAGES = {
  driver: gt3Driver,
  'fairway-wood': elyte3Wood,
  hybrid: g430Hybrid,
  jernsaet,
  wedge: vokeyWedges,
  putter: puttershot,
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
                    <span className={css.disc}>
                      <img className={css.image} src={IMAGES[category.id]} alt="" loading="lazy" />
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
