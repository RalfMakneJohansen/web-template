import React from 'react';
import classNames from 'classnames';

import { FormattedMessage } from '../../util/reactIntl';
import { mentionsOffPlatformPayment } from '../../util/fairwaySafety';

import css from './OffPlatformWarning.module.css';

/**
 * FAIRWAY: a reminder to keep payment on Fairway, under a message field.
 *
 * Shows a warning while the text mentions MobilePay, a bank transfer or a
 * phone number (util/fairwaySafety.js). With `showNote`, a quiet one-line
 * reminder is shown the rest of the time — used for the first message to a
 * seller, where the pattern usually starts.
 *
 * @component
 * @param {Object} props
 * @param {string} [props.className] - Custom class that extends the default class for the root element
 * @param {string} [props.text] - The message being typed
 * @param {boolean} [props.showNote] - Show the quiet reminder when there is nothing to warn about
 * @returns {JSX.Element|null}
 */
const OffPlatformWarning = props => {
  const { className, text, showNote = false } = props;
  const warn = mentionsOffPlatformPayment(text);

  // The live region stays in the page so screen readers hear the warning appear.
  return (
    <div className={classNames(css.root, className)} role="status" aria-live="polite">
      {warn ? (
        <p className={css.warning}>
          <FormattedMessage id="OffPlatformWarning.warning" />
        </p>
      ) : showNote ? (
        <p className={css.note}>
          <FormattedMessage id="OffPlatformWarning.note" />
        </p>
      ) : null}
    </div>
  );
};

export default OffPlatformWarning;
