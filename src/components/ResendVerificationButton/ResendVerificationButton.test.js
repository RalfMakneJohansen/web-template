import React from 'react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';

import { renderWithProviders as render, testingLibrary } from '../../util/testHelpers';

import ResendVerificationButton from './ResendVerificationButton';

const { screen } = testingLibrary;

describe('ResendVerificationButton', () => {
  it('sends and says where to look', async () => {
    const user = userEvent.setup({ delay: null });
    const onResend = jest.fn(() => Promise.resolve());
    render(<ResendVerificationButton onResend={onResend} email="ole@golf.dk" />);

    await user.click(screen.getByRole('button', { name: 'ResendVerificationButton.send' }));

    expect(onResend).toHaveBeenCalledTimes(1);
    expect(await screen.findByRole('status')).toHaveTextContent('ResendVerificationButton.sent');
  });

  it('explains a rate limit', async () => {
    const user = userEvent.setup({ delay: null });
    const tooMany = { status: 429, apiErrors: [{ code: 'email-too-many-verification-requests' }] };
    render(<ResendVerificationButton onResend={() => Promise.reject(tooMany)} email="x@y.dk" />);

    await user.click(screen.getByRole('button', { name: 'ResendVerificationButton.send' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('ResendVerificationButton.tooMany');
  });
});
