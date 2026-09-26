import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import classNames from 'classnames';

import { FormattedMessage, useIntl } from '../../util/reactIntl';
import { parse } from '../../util/urlHelpers';
import { ensureCurrentUser } from '../../util/data';
import { emailVerifiedAtOf } from '../../util/fairwayContact';
import { isScrollingDisabled } from '../../ducks/ui.duck';
import { sendVerificationEmail } from '../../ducks/user.duck';

import { LayoutSingleColumn, NamedLink, Page, ResendVerificationButton } from '../../components';

import TopbarContainer from '../../containers/TopbarContainer/TopbarContainer';
import FooterContainer from '../../containers/FooterContainer/FooterContainer';

import css from './EmailVerificationPage.module.css';

/*
  Parse verification token from URL. It has to be stringified explicitly, as
  parse would otherwise turn a numeric token into a number.
*/
const parseVerificationToken = search => {
  const verificationToken = parse(search).t;
  return verificationToken ? `${verificationToken}` : null;
};

/**
 * Which of the four screens to show.
 *
 * @returns {'loading'|'verifying'|'verified'|'failed'|'checkInbox'}
 */
export const verificationScreen = ({
  hasUser,
  token,
  isVerified,
  inProgress,
  error,
  emailVerified,
  pendingEmail,
}) => {
  if (!hasUser) {
    return 'loading';
  }
  // Just verified, or already verified with nothing pending
  if (isVerified || (emailVerified && !pendingEmail && !error)) {
    return 'verified';
  }
  if (inProgress) {
    return 'verifying';
  }
  if (error) {
    // A used link on an account that is verified anyway is not a failure
    return emailVerified && !pendingEmail ? 'verified' : 'failed';
  }
  return token ? 'verifying' : 'checkInbox';
};

// A tick that draws itself once
const DrawnCheck = () => (
  <svg className={css.check} width="72" height="72" viewBox="0 0 72 72" aria-hidden={true}>
    <circle className={css.checkRing} cx="36" cy="36" r="33" />
    <path className={css.checkMark} d="m22 37 9.5 9.5L51 27" />
  </svg>
);

const MailIcon = ({ className }) => (
  <svg className={className} width="64" height="64" viewBox="0 0 64 64" aria-hidden={true}>
    <rect x="8" y="14" width="48" height="36" rx="6" />
    <path d="m10 18 22 17 22-17" />
  </svg>
);

/**
 * FAIRWAY: the page the verification link in the email opens.
 *
 * The template verified the token and then redirected to the front page, so
 * the person never saw that it worked. Now the page says so — with the date,
 * which is also noted on the profile (emailVerification.duck) — and points on
 * to Min side or a first listing. A link that no longer works offers a new
 * one right there.
 *
 * @component
 * @returns {JSX.Element}
 */
const EmailVerificationPage = () => {
  const intl = useIntl();
  const dispatch = useDispatch();
  const location = useLocation();
  const scrollingDisabled = useSelector(isScrollingDisabled);
  const currentUser = useSelector(state => state.user?.currentUser);
  const { isVerified, verificationError, verificationInProgress } = useSelector(
    state => state.emailVerification
  );

  const user = ensureCurrentUser(currentUser);
  const { email, emailVerified, pendingEmail, profile = {} } = user.attributes;
  const token = parseVerificationToken(location?.search);
  const screen = verificationScreen({
    hasUser: !!user.id,
    token,
    isVerified,
    inProgress: verificationInProgress,
    error: verificationError,
    emailVerified,
    pendingEmail,
  });
  const verifiedAt = emailVerifiedAtOf(currentUser);
  const onResend = () => dispatch(sendVerificationEmail());

  return (
    <Page
      title={intl.formatMessage({ id: 'EmailVerificationPage.title' })}
      scrollingDisabled={scrollingDisabled}
      referrer="origin"
    >
      <LayoutSingleColumn
        mainColumnClassName={css.layoutWrapperMain}
        topbar={<TopbarContainer />}
        footer={<FooterContainer />}
      >
        <section className={css.stage}>
          <div className={classNames(css.card, css[`card_${screen}`])} aria-live="polite">
            {screen === 'loading' || screen === 'verifying' ? (
              <>
                <span className={css.spinner} aria-hidden={true} />
                <h1 className={css.title}>
                  <FormattedMessage id="EmailVerificationPage.verifyingTitle" />
                </h1>
              </>
            ) : screen === 'verified' ? (
              <>
                <DrawnCheck />
                <h1 className={css.title}>
                  <FormattedMessage
                    id="EmailVerificationPage.verifiedTitle"
                    values={{ name: profile.firstName }}
                  />
                </h1>
                <p className={css.text}>
                  <FormattedMessage
                    id="EmailVerificationPage.verifiedText"
                    values={{ email: <strong className={css.email}>{email}</strong> }}
                  />
                </p>
                {verifiedAt ? (
                  <p className={css.noted}>
                    <FormattedMessage
                      id="EmailVerificationPage.verifiedAt"
                      values={{
                        date: intl.formatDate(new Date(verifiedAt), {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        }),
                      }}
                    />
                  </p>
                ) : null}
                <div className={css.actions}>
                  <NamedLink name="OverviewPage" className={css.primary}>
                    <FormattedMessage id="EmailVerificationPage.toOverview" />
                  </NamedLink>
                  <NamedLink name="NewListingPage" className={css.secondary}>
                    <FormattedMessage id="EmailVerificationPage.toNewListing" />
                  </NamedLink>
                </div>
              </>
            ) : screen === 'failed' ? (
              <>
                <MailIcon className={classNames(css.mail, css.mailFailed)} />
                <h1 className={css.title}>
                  <FormattedMessage id="EmailVerificationPage.failedTitle" />
                </h1>
                <p className={css.text}>
                  <FormattedMessage
                    id="EmailVerificationPage.failedText"
                    values={{
                      email: <strong className={css.email}>{pendingEmail || email}</strong>,
                    }}
                  />
                </p>
                <div className={css.actions}>
                  <ResendVerificationButton onResend={onResend} email={pendingEmail || email} />
                </div>
              </>
            ) : (
              <>
                <MailIcon className={css.mail} />
                <h1 className={css.title}>
                  <FormattedMessage id="EmailVerificationPage.checkInboxTitle" />
                </h1>
                <p className={css.text}>
                  <FormattedMessage
                    id="EmailVerificationPage.checkInboxText"
                    values={{
                      email: <strong className={css.email}>{pendingEmail || email}</strong>,
                    }}
                  />
                </p>
                <div className={css.actions}>
                  <ResendVerificationButton onResend={onResend} email={pendingEmail || email} />
                  <NamedLink name="ContactDetailsPage" className={css.textLink}>
                    <FormattedMessage id="EmailVerificationPage.wrongEmail" />
                  </NamedLink>
                </div>
              </>
            )}
          </div>
        </section>
      </LayoutSingleColumn>
    </Page>
  );
};

export default EmailVerificationPage;
