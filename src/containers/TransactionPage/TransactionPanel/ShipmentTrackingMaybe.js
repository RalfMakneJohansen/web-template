import React, { useState } from 'react';
import { Form as FinalForm } from 'react-final-form';
import classNames from 'classnames';

// Import util modules
import { FormattedMessage, useIntl } from '../../../util/reactIntl';
import { composeValidators, required } from '../../../util/validators';
import { copyText } from '../../../util/clipboard';
import {
  CARRIERS,
  CARRIER_KEYS,
  SHIPMENT_EXCEPTION,
  isValidTrackingNumber,
  normaliseTrackingNumber,
  shipmentFrom,
  stepIndexFor,
} from '../../../util/fairwayTracking';

// Import shared components
import {
  ExternalLink,
  FieldSelect,
  FieldTextInput,
  Form,
  PrimaryButton,
} from '../../../components';

import css from './ShipmentTrackingMaybe.module.css';

const STEPS = ['label', 'onTheWay', 'delivered'];

// States in which a shipped order has a parcel worth following.
const TRACKED_STATES = [
  'purchased',
  'delivered',
  'received',
  'disputed',
  'completed',
  'reviewed',
  'reviewed-by-customer',
  'reviewed-by-provider',
];

/**
 * The seller's form for the number on their label.
 */
const AddTrackingForm = props => {
  const intl = useIntl();
  const { onSubmit, initialValues, onCancel } = props;
  const [submitError, setSubmitError] = useState(null);

  const handleSubmit = values =>
    onSubmit({
      carrier: values.carrier,
      trackingNumber: normaliseTrackingNumber(values.trackingNumber),
    })
      .then(() => setSubmitError(null))
      .catch(e => setSubmitError(e?.status === 503 ? 'notReady' : 'failed'));

  const validNumber = value =>
    value && !isValidTrackingNumber(value)
      ? intl.formatMessage({ id: 'ShipmentTracking.numberInvalid' })
      : undefined;

  return (
    <FinalForm
      onSubmit={handleSubmit}
      initialValues={initialValues}
      render={({ handleSubmit, submitting, invalid }) => (
        <Form className={css.form} onSubmit={handleSubmit}>
          <FieldSelect
            id="shipmentTracking.carrier"
            name="carrier"
            label={intl.formatMessage({ id: 'ShipmentTracking.carrierLabel' })}
            validate={required(intl.formatMessage({ id: 'ShipmentTracking.carrierRequired' }))}
          >
            <option value="" disabled>
              {intl.formatMessage({ id: 'ShipmentTracking.carrierPlaceholder' })}
            </option>
            {CARRIER_KEYS.map(key => (
              <option key={key} value={key}>
                {CARRIERS[key].name}
              </option>
            ))}
          </FieldSelect>
          <FieldTextInput
            id="shipmentTracking.trackingNumber"
            name="trackingNumber"
            type="text"
            autoComplete="off"
            label={intl.formatMessage({ id: 'ShipmentTracking.numberLabel' })}
            placeholder={intl.formatMessage({ id: 'ShipmentTracking.numberPlaceholder' })}
            validate={composeValidators(
              required(intl.formatMessage({ id: 'ShipmentTracking.numberRequired' })),
              validNumber
            )}
          />
          {submitError ? (
            <p className={css.error} role="alert">
              <FormattedMessage id={`ShipmentTracking.error.${submitError}`} />
            </p>
          ) : null}
          <div className={css.formActions}>
            <PrimaryButton
              type="submit"
              className={css.submit}
              inProgress={submitting}
              disabled={invalid || submitting}
            >
              <FormattedMessage id="ShipmentTracking.save" />
            </PrimaryButton>
            {onCancel ? (
              <button type="button" className={css.linkButton} onClick={onCancel}>
                <FormattedMessage id="ShipmentTracking.cancel" />
              </button>
            ) : null}
          </div>
        </Form>
      )}
    />
  );
};

/**
 * One leg's tracking: carrier, number, a link to the carrier and where the
 * parcel is on three steps.
 */
const ShipmentCard = props => {
  const intl = useIntl();
  const { shipment, titleId, isDelivered, onEdit } = props;
  const [copied, setCopied] = useState(false);

  // The order itself knows a parcel was delivered even when no scan said so.
  const status = isDelivered ? 'delivered' : shipment.status;
  const isException = status === SHIPMENT_EXCEPTION;
  const current = stepIndexFor(status);
  const updated = shipment.updatedAt ? new Date(shipment.updatedAt) : null;

  const onCopy = () =>
    copyText(shipment.trackingNumber).then(ok => {
      if (ok) {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    });

  return (
    <section className={css.card} aria-label={intl.formatMessage({ id: titleId })}>
      <div className={css.header}>
        <h3 className={css.title}>
          <FormattedMessage id={titleId} />
        </h3>
        {shipment.carrierName ? <span className={css.carrier}>{shipment.carrierName}</span> : null}
      </div>

      {isException ? (
        <p className={css.exception} role="status">
          <FormattedMessage id="ShipmentTracking.exception" />
        </p>
      ) : (
        <ol className={css.steps}>
          {STEPS.map((step, i) => (
            <li
              key={step}
              className={classNames(css.step, {
                [css.stepDone]: i < current || (i === current && status === 'delivered'),
                [css.stepCurrent]: i === current && status !== 'delivered',
              })}
              aria-current={i === current ? 'step' : undefined}
            >
              <span className={css.dot} aria-hidden={true} />
              <span className={css.stepLabel}>
                <FormattedMessage id={`ShipmentTracking.step.${step}`} />
              </span>
            </li>
          ))}
        </ol>
      )}

      {status === 'ready_for_pickup' ? (
        <p className={css.note}>
          <FormattedMessage id="ShipmentTracking.readyForPickup" />
        </p>
      ) : null}

      {shipment.trackingNumber ? (
        <div className={css.numberRow}>
          <span className={css.number}>{shipment.trackingNumber}</span>
          <button type="button" className={css.linkButton} onClick={onCopy}>
            <FormattedMessage id={copied ? 'ShipmentTracking.copied' : 'ShipmentTracking.copy'} />
          </button>
          {shipment.trackingUrl ? (
            <ExternalLink href={shipment.trackingUrl} className={css.follow}>
              <FormattedMessage id="ShipmentTracking.follow" />
            </ExternalLink>
          ) : null}
        </div>
      ) : null}

      {shipment.events.length > 0 ? (
        <details className={css.events}>
          <summary>
            <FormattedMessage
              id="ShipmentTracking.events"
              values={{ count: shipment.events.length }}
            />
          </summary>
          <ol className={css.eventList}>
            {shipment.events.map((e, i) => (
              <li key={`${e.at}-${i}`} className={css.event}>
                {e.at ? (
                  <time dateTime={e.at} className={css.eventTime}>
                    {intl.formatDate(new Date(e.at), {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </time>
                ) : null}
                <span>
                  {e.text}
                  {e.location ? ` · ${e.location}` : ''}
                </span>
              </li>
            ))}
          </ol>
        </details>
      ) : null}

      <div className={css.footer}>
        {updated && !isNaN(updated) ? (
          <span className={css.updated}>
            <FormattedMessage
              id="ShipmentTracking.updated"
              values={{
                date: intl.formatDate(updated, {
                  day: 'numeric',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit',
                }),
              }}
            />
          </span>
        ) : null}
        {onEdit ? (
          <button type="button" className={css.linkButton} onClick={onEdit}>
            <FormattedMessage id="ShipmentTracking.edit" />
          </button>
        ) : null}
      </div>
    </section>
  );
};

/**
 * FAIRWAY: track & trace on the order, for buyer and seller alike.
 *
 * Shows the parcel to the buyer and, for a Fairway box, the box on its way to
 * the seller — both from the order's metadata (util/fairwayTracking.js). While
 * the order waits to be sent, the seller can add or correct the number from
 * their label; the freight automation fills it in by itself once connected.
 *
 * @component
 * @param {Object} props
 * @param {string} props.processState - The transaction's current state in the process
 * @param {boolean} props.isCustomer - Whether the current user is the buyer
 * @param {string} props.deliveryMethod - 'shipping' | 'pickup'
 * @param {string} [props.shipmentType] - The listing's shipment_type
 * @param {Object} [props.metadata] - The transaction's metadata
 * @param {Function} [props.onAddTracking] - ({ carrier, trackingNumber }) => Promise, for the seller
 * @returns {JSX.Element|null} the tracking cards, or nothing for orders that are not shipped
 */
const ShipmentTrackingMaybe = props => {
  const { processState, isCustomer, deliveryMethod, shipmentType, metadata, onAddTracking } = props;
  const [editing, setEditing] = useState(false);

  if (deliveryMethod !== 'shipping' || !TRACKED_STATES.includes(processState)) {
    return null;
  }

  const parcel = shipmentFrom(metadata, 'parcel');
  const box = shipmentType === 'box' ? shipmentFrom(metadata, 'box') : null;
  const isWaiting = processState === 'purchased';
  const canEdit = !isCustomer && isWaiting && typeof onAddTracking === 'function';
  const showForm = canEdit && (!parcel || editing);

  // The box leg matters only until the seller has packed and sent the item.
  const showBox = box && isWaiting && !parcel;

  if (!parcel && !showBox && !showForm) {
    return null;
  }

  const onSubmit = values => onAddTracking(values).then(() => setEditing(false));

  return (
    <div className={css.root}>
      {showBox ? (
        <ShipmentCard
          shipment={box}
          titleId={
            isCustomer ? 'ShipmentTracking.boxTitle.customer' : 'ShipmentTracking.boxTitle.provider'
          }
          isDelivered={false}
        />
      ) : null}

      {parcel && !showForm ? (
        <ShipmentCard
          shipment={parcel}
          titleId="ShipmentTracking.parcelTitle"
          isDelivered={!isWaiting && parcel.status !== SHIPMENT_EXCEPTION}
          onEdit={canEdit ? () => setEditing(true) : null}
        />
      ) : null}

      {showForm ? (
        <section className={css.card}>
          <h3 className={css.title}>
            <FormattedMessage id="ShipmentTracking.addTitle" />
          </h3>
          <p className={css.lead}>
            <FormattedMessage id="ShipmentTracking.addLead" />
          </p>
          <AddTrackingForm
            onSubmit={onSubmit}
            initialValues={
              parcel ? { carrier: parcel.carrier || '', trackingNumber: parcel.trackingNumber } : {}
            }
            onCancel={parcel ? () => setEditing(false) : null}
          />
        </section>
      ) : null}
    </div>
  );
};

export default ShipmentTrackingMaybe;
