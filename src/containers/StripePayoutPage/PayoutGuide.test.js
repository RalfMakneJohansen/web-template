import React from 'react';
import '@testing-library/jest-dom';

import { renderWithProviders as render, testingLibrary } from '../../util/testHelpers';

import PayoutGuide, { payoutState } from './PayoutGuide';

const { screen } = testingLibrary;

describe('payoutState', () => {
  it('tells the four situations apart', () => {
    const state = (stripeAvailable, stripeConnected, requirementsMissing) =>
      payoutState({ stripeAvailable, stripeConnected, requirementsMissing });

    expect(state(false, false, false)).toEqual('unavailable');
    expect(state(true, false, false)).toEqual('notStarted');
    expect(state(true, true, true)).toEqual('needsInfo');
    expect(state(true, true, false)).toEqual('ready');
  });
});

describe('PayoutGuide', () => {
  it('walks a new seller through the steps and what to have ready', () => {
    render(
      <PayoutGuide state="notStarted">
        <p>the form</p>
      </PayoutGuide>
    );

    expect(screen.getByText('PayoutGuide.title.notStarted')).toBeInTheDocument();
    expect(screen.getByText('PayoutGuide.step.verify.title')).toBeInTheDocument();
    expect(screen.getByText('PayoutGuide.need.iban')).toBeInTheDocument();
    expect(screen.getByText('the form')).toBeInTheDocument();
  });

  it('marks the first step done once the account exists but Stripe needs more', () => {
    const { container } = render(<PayoutGuide state="needsInfo" />);
    const steps = container.querySelectorAll('li[style]');
    expect(steps[0].className).toMatch(/stepDone/);
    expect(steps[1].className).toMatch(/stepCurrent/);
  });

  it('drops the steps and the checklist once payouts are ready', () => {
    render(<PayoutGuide state="ready" bankLast4="1234" />);

    expect(screen.getByText('PayoutGuide.title.ready')).toBeInTheDocument();
    expect(screen.queryByText('PayoutGuide.step.verify.title')).not.toBeInTheDocument();
    expect(screen.queryByText('PayoutGuide.needsTitle')).not.toBeInTheDocument();
    // the questions stay
    expect(screen.getByText('PayoutGuide.q.when')).toBeInTheDocument();
  });
});
