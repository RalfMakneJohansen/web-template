import React, { useState } from 'react';
import classNames from 'classnames';

import { FormattedMessage } from '../../util/reactIntl';
import { isTooManyEmailVerificationRequestsError } from '../../util/errors';

import css from './ResendVerificationButton.module.css';

/**
 * FAIRWAY: "Send mailen igen" that actually sends — and says so.
 *
 * Presentational: the page passes the thunk (user.duck sendVerificationEmail).
 * Shows sending, sent (with where to look), too many requests, or failed.
 *
 * @component
 * @param {Object} props
 * @param {string} [props.className]
 * @param {Function} props.onResend - () => Promise, sends the verification email
 * @param {string} [props.email] - Where it goes, shown once sent
 * @returns {JSX.Element}
 */
const ResendVerificationButton = props => {
  const { className, onResend, email } = props;
  const [state, setState] = useState('idle');

  const onClick = () => {
    setState('sending');
    Promise.resolve(onResend())
      .then(() => setState('sent'))
      .catch(e => setState(isTooManyEmailVerificationRequestsError(e) ? 'tooMany' : 'failed'));
  };

  if (state === 'sent') {
    return (
      <p className={classNames(css.status, css.sent, className)} role="status">
        <FormattedMessage id="ResendVerificationButton.sent" values={{ email }} />
      </p>
    );
  }

  return (
    <span className={classNames(css.root, className)}>
      <button type="button" className={css.button} onClick={onClick} disabled={state === 'sending'}>
        <FormattedMessage
          id={
            state === 'sending'
              ? 'ResendVerificationButton.sending'
              : 'ResendVerificationButton.send'
          }
        />
      </button>
      {state === 'tooMany' || state === 'failed' ? (
        <span className={classNames(css.status, css.error)} role="alert">
          <FormattedMessage id={`ResendVerificationButton.${state}`} />
        </span>
      ) : null}
    </span>
  );
};

export default ResendVerificationButton;
