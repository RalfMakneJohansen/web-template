import React from 'react';
import classNames from 'classnames';
import { Form as FinalForm } from 'react-final-form';

import { FormattedMessage, useIntl } from '../../../../util/reactIntl';
import { LISTING_STATE_DRAFT } from '../../../../util/types';
import { appendSentence, descriptionPhrasesFor } from '../../../../util/fairwayGear';

import { Button, FieldTextInput, Form, H3, ListingLink } from '../../../../components';

import css from './EditListingDescriptionPanel.module.css';

/**
 * FAIRWAY: the things buyers ask about, as chips that add a sentence.
 *
 * A blank box is the hardest part of a listing to fill in on a phone. These
 * give the seller a start — and each one answers a question a buyer would
 * otherwise send as a message. A chip already in the text shows as used.
 */
const PhraseChips = props => {
  const { phrases, description, onAdd, intl } = props;
  const text = (description || '').toLowerCase();
  return (
    <div className={css.phrases}>
      <p className={css.phrasesLabel} id="descriptionPhrasesLabel">
        <FormattedMessage id="EditListingDescriptionPanel.phrasesLabel" />
      </p>
      <ul className={css.phraseList} aria-labelledby="descriptionPhrasesLabel">
        {phrases.map((id, i) => {
          const sentence = intl.formatMessage({ id: `EditListingDescriptionPanel.phrase.${id}` });
          const isUsed = text.includes(sentence.toLowerCase());
          return (
            <li key={id} className={css.phraseItem} style={{ '--i': i }}>
              <button
                type="button"
                className={isUsed ? classNames(css.phrase, css.phraseUsed) : css.phrase}
                onClick={() => onAdd(sentence)}
                disabled={isUsed}
              >
                <span className={css.phraseSign} aria-hidden={true}>
                  {isUsed ? '✓' : '+'}
                </span>
                {sentence}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

/**
 * Description gets its own step so the seller writes it after seeing their own
 * photos — by then they know what is worth mentioning.
 *
 * The field is optional in this version: the hard requirements before publishing
 * are category, brand, condition, price, three photos and a shipping choice.
 */
const EditListingDescriptionPanel = props => {
  const {
    className,
    rootClassName,
    listing,
    disabled,
    ready,
    onSubmit,
    submitButtonText,
    panelUpdated,
    updateInProgress,
    errors,
    updatePageTitle: UpdatePageTitle,
  } = props;

  const intl = useIntl();
  const classes = classNames(rootClassName || css.root, className);
  const isPublished = listing?.id && listing?.attributes?.state !== LISTING_STATE_DRAFT;

  const panelHeadingProps = isPublished
    ? {
        id: 'EditListingDescriptionPanel.title',
        values: { listingTitle: <ListingLink listing={listing} />, lineBreak: <br /> },
        messageProps: { listingTitle: listing.attributes.title },
      }
    : {
        id: 'EditListingDescriptionPanel.createListingTitle',
        values: { lineBreak: <br /> },
        messageProps: {},
      };

  return (
    <main className={classes}>
      <UpdatePageTitle
        panelHeading={intl.formatMessage(
          { id: panelHeadingProps.id },
          { ...panelHeadingProps.messageProps }
        )}
      />
      <H3 as="h1">
        <FormattedMessage id={panelHeadingProps.id} values={{ ...panelHeadingProps.values }} />
      </H3>

      <FinalForm
        initialValues={{ description: listing?.attributes?.description }}
        onSubmit={values => onSubmit({ description: values.description || '' })}
        render={formRenderProps => {
          const { handleSubmit, invalid, pristine, values, form } = formRenderProps;
          const phrases = descriptionPhrasesFor(listing?.attributes?.publicData?.categoryLevel1);
          const length = (values.description || '').trim().length;
          const { updateListingError, showListingsError } = errors || {};
          const submitReady = (panelUpdated && pristine) || ready;
          const submitInProgress = updateInProgress;
          const submitDisabled = invalid || disabled || submitInProgress;

          return (
            <Form className={css.form} onSubmit={handleSubmit}>
              {updateListingError ? (
                <p className={css.error}>
                  <FormattedMessage id="EditListingDescriptionPanel.updateFailed" />
                </p>
              ) : null}
              {showListingsError ? (
                <p className={css.error}>
                  <FormattedMessage id="EditListingDescriptionPanel.showListingFailed" />
                </p>
              ) : null}

              <p className={css.hint}>
                <FormattedMessage id="EditListingDescriptionPanel.hint" />
              </p>

              <FieldTextInput
                id="description"
                name="description"
                className={css.description}
                type="textarea"
                label={intl.formatMessage({ id: 'EditListingDescriptionPanel.label' })}
                placeholder={intl.formatMessage({
                  id: 'EditListingDescriptionPanel.placeholder',
                })}
                inputRootClass={css.textarea}
              />
              <p className={css.counter} aria-live="polite">
                {length === 0 ? null : length < 40 ? (
                  <FormattedMessage id="EditListingDescriptionPanel.counterShort" />
                ) : (
                  <span className={css.counterGood}>
                    <FormattedMessage id="EditListingDescriptionPanel.counterGood" />
                  </span>
                )}
              </p>

              <PhraseChips
                phrases={phrases}
                description={values.description}
                intl={intl}
                onAdd={sentence =>
                  form.change('description', appendSentence(values.description, sentence))
                }
              />

              <Button
                className={css.submitButton}
                type="submit"
                inProgress={submitInProgress}
                disabled={submitDisabled}
                ready={submitReady}
              >
                {submitButtonText}
              </Button>

              {!values.description ? (
                <p className={css.optionalNote}>
                  <FormattedMessage id="EditListingDescriptionPanel.optional" />
                </p>
              ) : null}
            </Form>
          );
        }}
      />
    </main>
  );
};

export default EditListingDescriptionPanel;
