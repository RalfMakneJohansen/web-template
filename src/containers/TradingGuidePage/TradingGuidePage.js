import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Form as FinalForm } from 'react-final-form';

import { useConfiguration } from '../../context/configurationContext';

import { FormattedMessage, useIntl } from '../../util/reactIntl';
import { senderInitialValues, senderProfileUpdate } from '../../util/fairwayContact';
import { showCreateListingLinkForUser, showPaymentDetailsForUser } from '../../util/userHelpers';

import { isScrollingDisabled } from '../../ducks/ui.duck';

import {
  Button,
  Form,
  H3,
  LayoutSideNavigation,
  NamedLink,
  Page,
  SenderAddressFields,
  TradeReadiness,
  UserNav,
} from '../../components';

import TopbarContainer from '../../containers/TopbarContainer/TopbarContainer';
import FooterContainer from '../../containers/FooterContainer/FooterContainer';

import { updateProfile } from '../ProfileSettingsPage/ProfileSettingsPage.duck';
import { sendVerificationEmail } from '../../ducks/user.duck';

import css from './TradingGuidePage.module.css';

// The steps of a trade, in order, for each side. Texts live in translations
// as TradingGuidePage.<side>.<step>.title / .text.
const SELLER_STEPS = ['list', 'sender', 'payout', 'sold', 'paid'];
const BUYER_STEPS = ['find', 'pay', 'held', 'receive', 'approve'];
const STRIPE_QUESTIONS = ['why', 'identity', 'needs', 'fees'];

const Steps = ({ side, steps }) => (
  <ol className={css.steps}>
    {steps.map((step, index) => (
      <li key={step} className={css.step}>
        <span className={css.stepNumber} aria-hidden={true}>
          {index + 1}
        </span>
        <span className={css.stepCopy}>
          <span className={css.stepTitle}>
            <FormattedMessage id={`TradingGuidePage.${side}.${step}.title`} />
          </span>
          <span className={css.stepText}>
            <FormattedMessage id={`TradingGuidePage.${side}.${step}.text`} />
          </span>
        </span>
      </li>
    ))}
  </ol>
);

/**
 * FAIRWAY: what it takes to trade, and where you stand.
 *
 * Payments go through Stripe and freight through our labels, and each side
 * has a few things to do for that to work. This page puts them in one place:
 * the user's own checklist at the top, then the steps of a sale and of a
 * purchase, what Stripe does and why sellers are asked to verify their
 * identity, and the sender address form, which otherwise only exists inside
 * a listing's shipping step.
 *
 * Lives under account settings as the first tab.
 *
 * @component
 * @returns {JSX.Element} the trading guide page
 */
const TradingGuidePage = () => {
  const config = useConfiguration();
  const intl = useIntl();
  const dispatch = useDispatch();
  const currentUser = useSelector(state => state.user?.currentUser);
  const scrollingDisabled = useSelector(isScrollingDisabled);
  const [saveState, setSaveState] = useState({ inProgress: false, saved: false, failed: false });

  const title = intl.formatMessage({ id: 'TradingGuidePage.title' });
  const showManageListingsLink = showCreateListingLinkForUser(config, currentUser);
  const { showPayoutDetails, showPaymentMethods } = showPaymentDetailsForUser(config, currentUser);
  const accountSettingsNavProps = {
    currentPage: 'TradingGuidePage',
    showPaymentMethods,
    showPayoutDetails,
    currentUser,
  };

  const handleSenderSubmit = values => {
    setSaveState({ inProgress: true, saved: false, failed: false });
    return Promise.resolve(dispatch(updateProfile(senderProfileUpdate(values))))
      .then(result => {
        const failed = !!result?.error;
        setSaveState({ inProgress: false, saved: !failed, failed });
      })
      .catch(() => setSaveState({ inProgress: false, saved: false, failed: true }));
  };

  return (
    <Page title={title} scrollingDisabled={scrollingDisabled}>
      <LayoutSideNavigation
        topbar={
          <>
            <TopbarContainer />
            <UserNav
              currentPage="TradingGuidePage"
              showManageListingsLink={showManageListingsLink}
            />
          </>
        }
        sideNav={null}
        useAccountSettingsNav
        accountSettingsNavProps={accountSettingsNavProps}
        footer={<FooterContainer />}
        intl={intl}
      >
        <div className={css.content}>
          <H3 as="h1" className={css.heading}>
            <FormattedMessage id="TradingGuidePage.heading" />
          </H3>
          <p className={css.lead}>
            <FormattedMessage id="TradingGuidePage.lead" />
          </p>

          <TradeReadiness
            className={css.readiness}
            currentUser={currentUser}
            context="guide"
            onResendVerification={() => dispatch(sendVerificationEmail())}
          />

          <section className={css.section} aria-labelledby="guide-seller">
            <h2 id="guide-seller" className={css.sectionTitle}>
              <FormattedMessage id="TradingGuidePage.seller.heading" />
            </h2>
            <Steps side="seller" steps={SELLER_STEPS} />
            <NamedLink className={css.sectionCta} name="NewListingPage">
              <FormattedMessage id="TradingGuidePage.seller.cta" />
            </NamedLink>
          </section>

          <section className={css.section} aria-labelledby="guide-buyer">
            <h2 id="guide-buyer" className={css.sectionTitle}>
              <FormattedMessage id="TradingGuidePage.buyer.heading" />
            </h2>
            <Steps side="buyer" steps={BUYER_STEPS} />
            <NamedLink className={css.sectionCtaSecondary} name="SearchPage">
              <FormattedMessage id="TradingGuidePage.buyer.cta" />
            </NamedLink>
          </section>

          <section className={css.section} aria-labelledby="guide-stripe">
            <h2 id="guide-stripe" className={css.sectionTitle}>
              <FormattedMessage id="TradingGuidePage.stripe.heading" />
            </h2>
            <dl className={css.questions}>
              {STRIPE_QUESTIONS.map(q => (
                <div key={q} className={css.question}>
                  <dt className={css.questionTitle}>
                    <FormattedMessage id={`TradingGuidePage.stripe.${q}.title`} />
                  </dt>
                  <dd className={css.questionText}>
                    <FormattedMessage id={`TradingGuidePage.stripe.${q}.text`} />
                  </dd>
                </div>
              ))}
            </dl>
          </section>

          <section id="afsender" className={css.section} aria-labelledby="guide-sender">
            <h2 id="guide-sender" className={css.sectionTitle}>
              <FormattedMessage id="TradingGuidePage.sender.heading" />
            </h2>
            <p className={css.sectionLead}>
              <FormattedMessage id="TradingGuidePage.sender.lead" />
            </p>
            {currentUser?.id ? (
              <FinalForm
                initialValues={senderInitialValues(currentUser)}
                onSubmit={handleSenderSubmit}
                render={({ handleSubmit, invalid, pristine }) => (
                  <Form className={css.senderForm} onSubmit={handleSubmit}>
                    <SenderAddressFields idPrefix="guideSender" />
                    {saveState.failed ? (
                      <p className={css.error}>
                        <FormattedMessage id="TradingGuidePage.sender.saveFailed" />
                      </p>
                    ) : null}
                    <Button
                      className={css.submit}
                      type="submit"
                      inProgress={saveState.inProgress}
                      disabled={invalid || saveState.inProgress}
                      ready={saveState.saved && pristine}
                    >
                      <FormattedMessage id="TradingGuidePage.sender.save" />
                    </Button>
                  </Form>
                )}
              />
            ) : null}
          </section>
        </div>
      </LayoutSideNavigation>
    </Page>
  );
};

export default TradingGuidePage;
