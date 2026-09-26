import React, { useEffect, useRef, useState } from 'react';
import { Field, useField, useForm } from 'react-final-form';
import classNames from 'classnames';

// Import util modules
import { FormattedMessage, useIntl } from '../../../../util/reactIntl';
import { canonicalBrand } from '../../../../util/fairwayGear';

// Import shared components
import { FieldTextInput, ValidationError } from '../../../../components';

// Import modules from this directory
import css from './GearFields.module.css';

/**
 * FAIRWAY: the listing's details as taps instead of forms.
 *
 * Step 1 used to be a column of text boxes and dropdowns — the same controls
 * you fill in to renew a passport. On a phone every dropdown opened the
 * system picker, one field at a time. These put the answers on the screen:
 * the likely brands as tiles, hand and shaft as a two-way switch, lofts and
 * flex as chips, condition as four cards that say what each word means.
 *
 * All of them are real radio groups underneath, so arrow keys, screen readers
 * and form validation behave exactly as they did with the select.
 */

const CheckMark = () => (
  <svg
    className={css.checkMark}
    width="12"
    height="12"
    viewBox="0 0 12 12"
    aria-hidden={true}
    focusable="false"
  >
    <path d="m2.5 6.2 2.3 2.3 4.7-5" />
  </svg>
);

/**
 * One answer out of a few, shown as tappable options.
 *
 * Two or three options become a segmented switch, more become chips, and
 * variant="cards" gives each option room for a line of explanation and a
 * small meter (used for condition, where the words alone mean different
 * things to different people).
 *
 * @component
 * @param {Object} props
 * @param {string} props.name - Final Form field name
 * @param {string} props.id - Unique id, also the radio group's name
 * @param {string} props.label - The question
 * @param {Array<{ key: string, label: string, hint?: string }>} props.options
 * @param {Function} [props.validate] - Final Form validator
 * @param {boolean} [props.isRequired] - Optional fields can be un-chosen by tapping again
 * @param {'auto'|'cards'} [props.variant]
 * @param {string} [props.className]
 * @returns {JSX.Element}
 */
export const FieldChoiceChips = props => {
  const { name, id, label, options, validate, isRequired, variant = 'auto', className } = props;
  const layout = variant === 'cards' ? css.cards : options.length <= 3 ? css.segmented : css.chips;

  return (
    <Field name={name} validate={validate}>
      {({ input, meta }) => (
        <fieldset className={classNames(css.group, className)} aria-labelledby={`${id}.legend`}>
          <legend className={css.legend} id={`${id}.legend`}>
            {label}
          </legend>
          <div className={layout} style={{ '--count': options.length }}>
            {options.map((option, i) => {
              const optionId = `${id}.${option.key}`;
              const checked = `${input.value}` === `${option.key}`;
              // Condition is listed best first: the first option fills the meter
              const level = options.length - i;
              return (
                <span key={option.key} className={css.choice}>
                  <input
                    type="radio"
                    className={css.radio}
                    id={optionId}
                    name={id}
                    value={option.key}
                    checked={checked}
                    onChange={() => input.onChange(option.key)}
                    onClick={() => {
                      if (checked && !isRequired) {
                        input.onChange(null);
                      }
                    }}
                    onFocus={input.onFocus}
                    onBlur={input.onBlur}
                  />
                  <label
                    htmlFor={optionId}
                    className={classNames(css.option, { [css.optionSelected]: checked })}
                  >
                    {variant === 'cards' ? (
                      <>
                        <span className={css.meter} aria-hidden={true}>
                          {options.map((_, bar) => (
                            <span
                              key={bar}
                              className={classNames(css.bar, {
                                [css.barOn]: bar < level,
                              })}
                            />
                          ))}
                        </span>
                        <span className={css.cardLabel}>{option.label}</span>
                        {option.hint ? <span className={css.cardHint}>{option.hint}</span> : null}
                      </>
                    ) : (
                      option.label
                    )}
                    {checked ? <CheckMark /> : null}
                  </label>
                </span>
              );
            })}
          </div>
          <ValidationError fieldMeta={meta} />
        </fieldset>
      )}
    </Field>
  );
};

const OTHER = '__other';

// The brand tiles and, behind "Andet mærke", a field for anything else
const BrandPicker = props => {
  const { input, meta, id, label, brands, allBrands, placeholder } = props;
  const intl = useIntl();
  const value = input.value || '';
  const isTile = brands.includes(value);
  const [typing, setTyping] = useState(!!value && !isTile);
  const inputRef = useRef(null);
  const wantsFocus = useRef(false);

  useEffect(() => {
    if (typing && wantsFocus.current && inputRef.current) {
      wantsFocus.current = false;
      inputRef.current.focus();
    }
  }, [typing]);

  const choose = brand => {
    setTyping(false);
    input.onChange(brand);
  };

  const chooseOther = () => {
    wantsFocus.current = true;
    setTyping(true);
    if (isTile) {
      input.onChange('');
    }
  };

  const tiles = [...brands, OTHER];
  const otherChecked = typing || (!!value && !isTile);
  const listId = `${id}.all`;
  const textId = `${id}.text`;

  return (
    <fieldset className={css.group} aria-labelledby={`${id}.legend`}>
      <legend className={css.legend} id={`${id}.legend`}>
        {label}
      </legend>
      <div className={css.tiles}>
        {tiles.map(brand => {
          const isOther = brand === OTHER;
          const checked = isOther ? otherChecked : !typing && value === brand;
          const optionId = `${id}.${isOther ? 'other' : brand.replace(/\W/g, '')}`;
          return (
            <span key={brand} className={css.choice}>
              <input
                type="radio"
                className={css.radio}
                id={optionId}
                name={id}
                value={brand}
                checked={checked}
                onChange={() => (isOther ? chooseOther() : choose(brand))}
                onFocus={input.onFocus}
                onBlur={() => {
                  if (!isOther) {
                    input.onBlur();
                  }
                }}
              />
              <label
                htmlFor={optionId}
                className={classNames(css.tile, {
                  [css.optionSelected]: checked,
                  [css.tileOther]: isOther,
                })}
              >
                {isOther ? <FormattedMessage id="GearFields.otherBrand" /> : brand}
                {checked && !isOther ? <CheckMark /> : null}
              </label>
            </span>
          );
        })}
      </div>

      {otherChecked ? (
        <div className={css.otherBrand}>
          <label className={css.srOnly} htmlFor={textId}>
            {intl.formatMessage({ id: 'GearFields.otherBrandLabel' })}
          </label>
          <input
            ref={inputRef}
            id={textId}
            className={css.textInput}
            type="text"
            value={value}
            maxLength={70}
            autoComplete="off"
            list={listId}
            placeholder={placeholder}
            onChange={e => input.onChange(e.target.value)}
            onFocus={input.onFocus}
            onBlur={() => {
              // "taylor made" becomes TaylorMade, and lands on its tile
              const known = canonicalBrand(value, allBrands);
              if (known !== value) {
                input.onChange(known);
              }
              if (brands.includes(known)) {
                setTyping(false);
              }
              input.onBlur();
            }}
          />
          <datalist id={listId}>
            {allBrands.map(brand => (
              <option key={brand} value={brand} />
            ))}
          </datalist>
        </div>
      ) : null}
      <ValidationError fieldMeta={meta} />
    </fieldset>
  );
};

/**
 * The brand as tiles for the ones most sold in this category, plus a tile
 * that opens a text field (with every known brand as suggestions) for the rest.
 *
 * @component
 * @param {Object} props
 * @param {string} props.name - Final Form field name
 * @param {string} props.id - Unique id
 * @param {string} props.label - The question
 * @param {Array<string>} props.brands - Brands shown as tiles
 * @param {Array<string>} props.allBrands - Every brand we know, for suggestions
 * @param {string} [props.placeholder]
 * @param {Function} [props.validate]
 * @returns {JSX.Element}
 */
export const FieldBrandPicker = props => {
  const { name, validate, ...rest } = props;
  return (
    <Field name={name} validate={validate}>
      {({ input, meta }) => <BrandPicker input={input} meta={meta} {...rest} />}
    </Field>
  );
};

/**
 * A text field with the likely answers underneath as one-tap chips.
 *
 * Used for the model (the chips follow the brand chosen above) and for which
 * irons a set contains. The seller can still write anything.
 *
 * @component
 * @param {Object} props
 * @param {string} props.name - Final Form field name
 * @param {string} props.id - Unique id
 * @param {string} props.label - The question
 * @param {Array<string>} props.suggestions - Offered answers, most likely first
 * @param {number} [props.maxChips] - How many are shown as chips (all go in the datalist)
 * @param {string} [props.placeholder]
 * @param {Function} [props.validate]
 * @returns {JSX.Element}
 */
export const FieldTextSuggest = props => {
  const { name, id, label, suggestions = [], maxChips = 8, placeholder, validate } = props;
  const form = useForm();
  const { input } = useField(name, { subscription: { value: true } });
  const value = typeof input.value === 'string' ? input.value.trim() : '';
  const chips = suggestions.slice(0, maxChips);
  const listId = `${id}.suggestions`;
  const hasSuggestions = suggestions.length > 0;

  return (
    <div className={css.group}>
      <FieldTextInput
        id={id}
        name={name}
        type="text"
        className={css.textField}
        maxLength={70}
        label={label}
        placeholder={placeholder}
        autoComplete="off"
        validate={validate}
        {...(hasSuggestions ? { list: listId } : {})}
      />
      {hasSuggestions ? (
        <>
          <datalist id={listId}>
            {suggestions.map(option => (
              <option key={option} value={option} />
            ))}
          </datalist>
          <div className={css.suggestions}>
            <span className={css.suggestionsLabel} id={`${id}.chipsLabel`}>
              <FormattedMessage id="GearFields.suggestions" />
            </span>
            <ul className={css.suggestionList} aria-labelledby={`${id}.chipsLabel`}>
              {chips.map((option, i) => {
                const isChosen = value === option;
                return (
                  <li key={option} style={{ '--i': i }} className={css.suggestionItem}>
                    <button
                      type="button"
                      className={classNames(css.suggestion, {
                        [css.suggestionChosen]: isChosen,
                      })}
                      aria-pressed={isChosen}
                      onClick={() => {
                        form.change(name, isChosen ? '' : option);
                        form.blur(name);
                      }}
                    >
                      {option}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </>
      ) : null}
    </div>
  );
};

/**
 * The listing title, written from the answers above and shown as it will
 * read on the listing. The seller only has to look at it; "Ret titel" turns
 * it into a text field, and from then on the title is theirs and is no longer
 * rewritten. If they change their mind, one tap brings the suggestion back.
 *
 * @component
 * @param {Object} props
 * @param {string} props.id - Unique id for the input
 * @param {string} props.composed - The title the answers add up to ('' until there is a brand)
 * @param {string} props.label
 * @param {string} props.placeholder
 * @param {number} props.maxLength
 * @param {Function} props.validate
 * @returns {JSX.Element}
 */
export const FieldComposedTitle = props => {
  const { id, composed, label, placeholder, maxLength, validate } = props;
  const form = useForm();
  const { input } = useField('title', { subscription: { value: true } });
  const title = input.value || '';

  // A title saved earlier that matches the answers is still ours to keep in step
  const lastComposed = useRef(title && title === composed ? title : null);
  const [editing, setEditing] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (!composed || editing) {
      return;
    }
    const isOursOrEmpty = !title || title === lastComposed.current;
    if (isOursOrEmpty && title !== composed) {
      lastComposed.current = composed;
      form.change('title', composed);
    }
  }, [composed, title, editing, form]);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editing]);

  const isComposed = !!title && title === lastComposed.current;
  const showPreview = isComposed && !editing;
  const canRestore = !!composed && title !== composed;

  return (
    <div className={css.titleBlock}>
      {showPreview ? (
        <div className={css.titleCard}>
          <div className={css.titleCardHead}>
            <span className={css.titleEyebrow}>{label}</span>
            <span className={css.titleCount}>
              {title.length}/{maxLength}
            </span>
          </div>
          <p className={css.titleText} key={title} aria-live="polite">
            {title}
          </p>
          <div className={css.titleFoot}>
            <span className={css.titleNote}>
              <FormattedMessage id="GearFields.titleNote" />
            </span>
            <button type="button" className={css.linkButton} onClick={() => setEditing(true)}>
              <FormattedMessage id="GearFields.editTitle" />
            </button>
          </div>
          {/* keeps the title registered, so it is still validated and submitted */}
          <Field name="title" validate={validate} render={() => null} />
        </div>
      ) : (
        <>
          <FieldTextInput
            id={id}
            name="title"
            type="text"
            className={css.textField}
            label={label}
            placeholder={placeholder}
            maxLength={maxLength}
            validate={validate}
            inputRef={inputRef}
          />
          {canRestore ? (
            <button
              type="button"
              className={css.restore}
              onClick={() => {
                lastComposed.current = composed;
                setEditing(false);
                form.change('title', composed);
              }}
            >
              <FormattedMessage id="GearFields.useSuggestedTitle" values={{ title: composed }} />
            </button>
          ) : null}
        </>
      )}
    </div>
  );
};
