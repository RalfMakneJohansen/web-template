import React, { useState } from 'react';
import { Form as FinalForm, Field } from 'react-final-form';
import classNames from 'classnames';

// Import util modules
import { FormattedMessage, useIntl } from '../../util/reactIntl';
import { subscribeNewsletter } from '../../util/api';
import { composeValidators, emailFormatValid, required } from '../../util/validators';

// Import shared components
import { Button, FieldTextInput, Form, NamedLink } from '../../components';

import css from './NewsletterSignup.module.css';

/**
 * FAIRWAY: "get the newest listings first" — the footer's newsletter sign-up.
 *
 * Sends the address to /api/newsletter (Mailchimp, double opt-in): the person
 * gets a confirmation mail, and only then newsletters. A hidden `company`
 * field catches bots.
 *
 * @component
 * @param {Object} props
 * @param {string} [props.className] - Custom class that extends the default class for the root element
 * @param {Function} [props.onSubscribe] - (values) => Promise; defaults to the API call
 * @returns {JSX.Element}
 */
const NewsletterSignup = props => {
  const { className, onSubscribe = subscribeNewsletter } = props;
  const intl = useIntl();
  const [done, setDone] = useState(false);
  const [error, setError] = useState(null);

  const onSubmit = values =>
    onSubscribe({ email: values.email, company: values.company || '' })
      .then(() => {
        setError(null);
        setDone(true);
      })
      .catch(e => {
        const code = e?.error;
        setError(['invalid-email', 'too-many', 'not-configured'].includes(code) ? code : 'failed');
      });

  return (
    <section className={classNames(css.root, className)} aria-labelledby="newsletter-title">
      <div className={css.copy}>
        <span className={css.eyebrow}>
          <FormattedMessage id="NewsletterSignup.eyebrow" />
        </span>
        <h2 id="newsletter-title" className={css.title}>
          <FormattedMessage id="NewsletterSignup.title" />
        </h2>
        <p className={css.text}>
          <FormattedMessage id="NewsletterSignup.text" />
        </p>
      </div>

      {done ? (
        <p className={css.success} role="status">
          <FormattedMessage id="NewsletterSignup.success" />
        </p>
      ) : (
        <FinalForm
          onSubmit={onSubmit}
          render={({ handleSubmit, submitting, errors, submitFailed }) => (
            <Form className={css.form} onSubmit={handleSubmit} noValidate>
              <div className={css.row}>
                <FieldTextInput
                  className={css.field}
                  labelClassName={css.label}
                  hideErrorMessage
                  aria-describedby="newsletter.feedback"
                  id="newsletter.email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  label={intl.formatMessage({ id: 'NewsletterSignup.emailLabel' })}
                  placeholder={intl.formatMessage({ id: 'NewsletterSignup.emailPlaceholder' })}
                  validate={composeValidators(
                    required(intl.formatMessage({ id: 'NewsletterSignup.emailRequired' })),
                    emailFormatValid(intl.formatMessage({ id: 'NewsletterSignup.emailInvalid' }))
                  )}
                />
                <Button
                  type="submit"
                  rootClassName={css.submit}
                  inProgress={submitting}
                  disabled={submitting}
                >
                  <FormattedMessage id="NewsletterSignup.submit" />
                </Button>
              </div>

              {/* Hidden from people, tempting to bots */}
              <div className={css.trap} aria-hidden="true">
                <label htmlFor="newsletter.company">Company</label>
                <Field
                  id="newsletter.company"
                  name="company"
                  component="input"
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                />
              </div>

              {/* Field errors and server errors share one readable spot on the dark card */}
              <div id="newsletter.feedback" role="alert">
                {submitFailed && errors?.email ? (
                  <p className={css.error}>{errors.email}</p>
                ) : error ? (
                  <p className={css.error}>
                    <FormattedMessage id={`NewsletterSignup.error.${error}`} />
                  </p>
                ) : null}
              </div>

              <p className={css.consent}>
                <FormattedMessage
                  id="NewsletterSignup.consent"
                  values={{
                    privacyLink: (
                      <NamedLink name="PrivacyPolicyPage" className={css.consentLink}>
                        <FormattedMessage id="NewsletterSignup.privacyLink" />
                      </NamedLink>
                    ),
                  }}
                />
              </p>
            </Form>
          )}
        />
      )}
    </section>
  );
};

export default NewsletterSignup;
