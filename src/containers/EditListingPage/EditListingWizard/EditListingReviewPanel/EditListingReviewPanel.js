import React from 'react';
import classNames from 'classnames';

import { FormattedMessage, useIntl } from '../../../../util/reactIntl';
import { formatMoney } from '../../../../util/currency';
import { isFieldForCategory } from '../../../../util/fieldHelpers';
import { LISTING_STATE_DRAFT } from '../../../../util/types';

import { Button, H3, ListingLink, NamedLink } from '../../../../components';

import css from './EditListingReviewPanel.module.css';

/**
 * The last step: everything the seller entered, in one place, with a way back to
 * each step.
 *
 * It also re-checks the hard requirements. The wizard already blocks the tabs,
 * but a draft edited out of order can still arrive here incomplete, and the
 * seller deserves to be told which field is missing rather than "something is
 * wrong".
 */
const findFieldLabel = (config, key) => {
  const field = config.listing.listingFields.find(f => f.key === key);
  return field?.showConfig?.label || field?.saveConfig?.label || key;
};

const findEnumLabel = (config, key, value) => {
  const field = config.listing.listingFields.find(f => f.key === key);
  const option = field?.enumOptions?.find(o => `${o.option}` === `${value}`);
  return option?.label || value;
};

const findCategoryLabel = (config, id) => {
  const category = config.categoryConfiguration?.categories?.find(c => c.id === id);
  return category?.name || id;
};

const EditListingReviewPanel = props => {
  const {
    className,
    rootClassName,
    listing,
    config,
    params,
    disabled,
    ready,
    onSubmit,
    submitButtonText,
    updateInProgress,
    errors,
    updatePageTitle: UpdatePageTitle,
  } = props;

  const intl = useIntl();
  const classes = classNames(rootClassName || css.root, className);
  const isPublished = listing?.id && listing?.attributes?.state !== LISTING_STATE_DRAFT;

  const { title, description, price, publicData } = listing?.attributes || {};
  const { categoryLevel1, brand, model, condition, shipment_type: shipmentType } =
    publicData || {};
  const images = listing?.images || [];
  const minImages = config.listing.minListingImages || 3;

  // Each missing requirement names its own field and the step that fixes it.
  const alreadyRequired = ['brand', 'condition', 'shipment_type'];
  const missing = [
    !categoryLevel1 && { id: 'category', tab: 'details' },
    !brand && { id: 'brand', tab: 'details' },
    !condition && { id: 'condition', tab: 'details' },
    !(price && price.amount > 0) && { id: 'price', tab: 'pricing-and-stock' },
    images.length < minImages && { id: 'images', tab: 'photos' },
    !shipmentType && { id: 'shipment', tab: 'shipping' },
  ].filter(Boolean);

  // Required fields that only exist for some categories — hand, flex, loft.
  // Read off the config so the list stays right when a field is added or a
  // category changes.
  const missingCategoryFields = config.listing.listingFields
    .filter(field => field.scope === 'public')
    .filter(field => field.saveConfig?.isRequired)
    .filter(field => !alreadyRequired.includes(field.key))
    .filter(field => isFieldForCategory([categoryLevel1], field))
    .filter(field => {
      const value = publicData?.[field.key];
      return value == null || value === '';
    })
    .map(field => ({
      id: field.key,
      tab: 'details',
      text: field.saveConfig?.requiredMessage || `Udfyld ${findFieldLabel(config, field.key)}.`,
    }));

  // Everything the seller filled in that is specific to this category — flex,
  // loft, shaft and so on. Read off the config so a new field in
  // configListing.js shows up here without touching this panel.
  const alreadyShown = ['brand', 'model', 'condition', 'shipment_type'];
  const categorySpecificRows = config.listing.listingFields
    .filter(field => field.scope === 'public')
    .filter(field => !alreadyShown.includes(field.key))
    .filter(field => isFieldForCategory([categoryLevel1], field))
    .map(field => {
      const raw = publicData?.[field.key];
      if (raw == null || raw === '') {
        return null;
      }
      const value = field.enumOptions ? findEnumLabel(config, field.key, raw) : raw;
      return { label: findFieldLabel(config, field.key), value, tab: 'details' };
    })
    .filter(Boolean);

  const allMissing = [...missing, ...missingCategoryFields];

  const rows = [
    { labelId: 'EditListingReviewPanel.category', value: findCategoryLabel(config, categoryLevel1), tab: 'details' },
    { labelId: 'EditListingReviewPanel.brand', value: brand, tab: 'details' },
    { labelId: 'EditListingReviewPanel.model', value: model, tab: 'details' },
    {
      labelId: 'EditListingReviewPanel.condition',
      value: condition ? findEnumLabel(config, 'condition', condition) : null,
      tab: 'details',
    },
    ...categorySpecificRows,
    {
      labelId: 'EditListingReviewPanel.price',
      value: price ? formatMoney(intl, price) : null,
      tab: 'pricing-and-stock',
    },
    {
      labelId: 'EditListingReviewPanel.images',
      value: intl.formatMessage({ id: 'EditListingReviewPanel.imageCount' }, { count: images.length }),
      tab: 'photos',
    },
    { labelId: 'EditListingReviewPanel.description', value: description, tab: 'description' },
    {
      labelId: 'EditListingReviewPanel.shipment',
      value: shipmentType ? findEnumLabel(config, 'shipment_type', shipmentType) : null,
      tab: 'shipping',
    },
  ];

  const panelHeadingProps = isPublished
    ? {
        id: 'EditListingReviewPanel.title',
        values: { listingTitle: <ListingLink listing={listing} />, lineBreak: <br /> },
        messageProps: { listingTitle: listing.attributes.title },
      }
    : {
        id: 'EditListingReviewPanel.createListingTitle',
        values: { lineBreak: <br /> },
        messageProps: {},
      };

  const { updateListingError, publishListingError } = errors || {};

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

      {updateListingError ? (
        <p className={css.error}>
          <FormattedMessage id="EditListingReviewPanel.updateFailed" />
        </p>
      ) : null}
      {publishListingError ? (
        <p className={css.error}>
          <FormattedMessage id="EditListingReviewPanel.publishFailed" />
        </p>
      ) : null}

      <p className={css.listingTitle}>{title}</p>

      {images.length > 0 ? (
        <ul className={css.thumbs}>
          {images.slice(0, 6).map(image => {
            const variant =
              image?.attributes?.variants?.['listing-card'] ||
              image?.attributes?.variants?.['square-small'] ||
              Object.values(image?.attributes?.variants || {})[0];
            return variant ? (
              <li key={image.id.uuid}>
                <img className={css.thumb} src={variant.url} alt="" />
              </li>
            ) : null;
          })}
        </ul>
      ) : null}

      <dl className={css.rows}>
        {rows.map(row => (
          <div key={row.labelId || row.label} className={css.row}>
            <dt className={css.rowLabel}>
              {row.labelId ? <FormattedMessage id={row.labelId} /> : row.label}
            </dt>
            <dd className={css.rowValue}>
              {row.value ? (
                row.value
              ) : (
                <span className={css.rowEmpty}>
                  <FormattedMessage id="EditListingReviewPanel.notSet" />
                </span>
              )}
              <NamedLink
                name="EditListingPage"
                params={{ ...params, tab: row.tab }}
                className={css.editLink}
              >
                <FormattedMessage id="EditListingReviewPanel.edit" />
              </NamedLink>
            </dd>
          </div>
        ))}
      </dl>

      {allMissing.length > 0 ? (
        <div className={css.missing}>
          <p className={css.missingTitle}>
            <FormattedMessage id="EditListingReviewPanel.missingTitle" />
          </p>
          <ul className={css.missingList}>
            {allMissing.map(item => (
              <li key={item.id} className={css.missingItem}>
                {item.text ? (
                  item.text
                ) : (
                  <FormattedMessage
                    id={`EditListingReviewPanel.missing.${item.id}`}
                    values={{ count: minImages }}
                  />
                )}
                <NamedLink
                  name="EditListingPage"
                  params={{ ...params, tab: item.tab }}
                  className={css.editLink}
                >
                  <FormattedMessage id="EditListingReviewPanel.fix" />
                </NamedLink>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <Button
        className={css.submitButton}
        type="button"
        inProgress={updateInProgress}
        disabled={disabled || updateInProgress || allMissing.length > 0}
        ready={ready}
        onClick={() => onSubmit({})}
      >
        {submitButtonText}
      </Button>
    </main>
  );
};

export default EditListingReviewPanel;
