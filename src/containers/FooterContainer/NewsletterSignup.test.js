import React from 'react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';

import { renderWithProviders as render, testingLibrary } from '../../util/testHelpers';

import NewsletterSignup from './NewsletterSignup';

const { screen, waitFor } = testingLibrary;

describe('NewsletterSignup', () => {
  it('subscribes and asks the person to confirm by email', async () => {
    const user = userEvent.setup({ delay: null });
    const onSubscribe = jest.fn(() => Promise.resolve({ ok: true }));
    render(<NewsletterSignup onSubscribe={onSubscribe} />);

    await user.type(screen.getByLabelText('NewsletterSignup.emailLabel'), 'ole@golf.dk');
    await user.click(screen.getByRole('button', { name: 'NewsletterSignup.submit' }));

    await waitFor(() =>
      expect(onSubscribe).toHaveBeenCalledWith({ email: 'ole@golf.dk', company: '' })
    );
    expect(await screen.findByText('NewsletterSignup.success')).toBeInTheDocument();
  });

  it('does not send an invalid address', async () => {
    const user = userEvent.setup({ delay: null });
    const onSubscribe = jest.fn(() => Promise.resolve());
    render(<NewsletterSignup onSubscribe={onSubscribe} />);

    await user.type(screen.getByLabelText('NewsletterSignup.emailLabel'), 'ole@');
    await user.click(screen.getByRole('button', { name: 'NewsletterSignup.submit' }));

    expect(onSubscribe).not.toHaveBeenCalled();
    expect(screen.getByText('NewsletterSignup.emailInvalid')).toBeInTheDocument();
  });

  it('says sign-up opens soon while Mailchimp is not connected', async () => {
    const user = userEvent.setup({ delay: null });
    const onSubscribe = jest.fn(() => Promise.reject({ error: 'not-configured' }));
    render(<NewsletterSignup onSubscribe={onSubscribe} />);

    await user.type(screen.getByLabelText('NewsletterSignup.emailLabel'), 'ole@golf.dk');
    await user.click(screen.getByRole('button', { name: 'NewsletterSignup.submit' }));

    expect(await screen.findByText('NewsletterSignup.error.not-configured')).toBeInTheDocument();
  });
});
