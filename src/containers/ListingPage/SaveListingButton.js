import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory, useLocation } from 'react-router-dom';
import classNames from 'classnames';

import { FormattedMessage, useIntl } from '../../util/reactIntl';
import { isFavorite } from '../../util/favorites';
import { toggleFavorite } from '../../ducks/favorites.duck';

import css from './SaveListingButton.module.css';

const HeartIcon = ({ filled }) => (
  <svg
    className={classNames(css.heart, { [css.heartFilled]: filled })}
    width="20"
    height="20"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden={true}
  >
    <path d="M12 20.5s-7.5-4.4-7.5-10.2A4.3 4.3 0 0 1 12 7.6a4.3 4.3 0 0 1 7.5 2.7c0 5.8-7.5 10.2-7.5 10.2Z" />
  </svg>
);

/**
 * FAIRWAY: "Gem" — save a listing to come back to it.
 *
 * Saved listings are kept on the user's own profile (util/favorites.js) and
 * listed under "Gemte annoncer" on Min side. A visitor who isn't logged in is
 * sent to log in and brought back here.
 *
 * @component
 * @param {Object} props
 * @param {string} [props.className]
 * @param {string} props.listingId - The listing uuid
 * @param {boolean} [props.compact] - Just the heart, for tight spots
 * @returns {JSX.Element|null}
 */
const SaveListingButton = props => {
  const { className, listingId, compact = false } = props;
  const intl = useIntl();
  const dispatch = useDispatch();
  const history = useHistory();
  const location = useLocation();
  const currentUser = useSelector(state => state.user?.currentUser);
  const isAuthenticated = useSelector(state => state.auth?.isAuthenticated);
  const [inProgress, setInProgress] = useState(false);
  const [failed, setFailed] = useState(false);

  if (!listingId) {
    return null;
  }
  const saved = isFavorite(currentUser, listingId);
  const labelId = saved ? 'SaveListingButton.saved' : 'SaveListingButton.save';

  const onClick = () => {
    if (!isAuthenticated) {
      history.push({ pathname: '/login', state: { from: location } });
      return;
    }
    setInProgress(true);
    setFailed(false);
    dispatch(toggleFavorite(listingId))
      .catch(() => setFailed(true))
      .finally(() => setInProgress(false));
  };

  return (
    <button
      type="button"
      className={classNames(css.root, { [css.compact]: compact, [css.saved]: saved }, className)}
      onClick={onClick}
      disabled={inProgress}
      aria-pressed={saved}
      aria-label={compact ? intl.formatMessage({ id: labelId }) : undefined}
      title={failed ? intl.formatMessage({ id: 'SaveListingButton.failed' }) : undefined}
    >
      <HeartIcon filled={saved} />
      {compact ? null : (
        <span>
          <FormattedMessage id={failed ? 'SaveListingButton.failed' : labelId} />
        </span>
      )}
    </button>
  );
};

export default SaveListingButton;
