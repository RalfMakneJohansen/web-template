import React from 'react';
import '@testing-library/jest-dom';

import { renderWithProviders as render, testingLibrary } from '../../../util/testHelpers';

import ShareListingButton, { copyText } from './ShareListingButton';

const { screen, userEvent, waitFor } = testingLibrary;

describe('ShareListingButton', () => {
  afterEach(() => {
    delete navigator.share;
    delete navigator.clipboard;
    delete document.execCommand;
  });

  it('copies the link and says so when there is no share sheet', async () => {
    // After setup: user-event installs its own clipboard stub
    const user = userEvent.setup();
    const writeText = jest.fn(() => Promise.resolve());
    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true });
    render(<ShareListingButton listingId={{ uuid: 'l1' }} title="Driver" />);

    await user.click(screen.getByRole('button'));

    expect(writeText).toHaveBeenCalledWith(window.location.href);
    await waitFor(() =>
      expect(screen.getByText('ShareListingButton.copied')).toBeInTheDocument()
    );
  });

  it('falls back to the legacy copy command when the clipboard API is missing', async () => {
    document.execCommand = jest.fn(() => true);
    await expect(copyText('https://example.com')).resolves.toBe(true);
    expect(document.execCommand).toHaveBeenCalledWith('copy');
  });

  it('copies instead when the share sheet refuses', async () => {
    navigator.share = jest.fn(() => Promise.reject(new Error('NotAllowedError')));
    // After setup: user-event installs its own clipboard stub
    const user = userEvent.setup();
    const writeText = jest.fn(() => Promise.resolve());
    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true });
    render(<ShareListingButton listingId={{ uuid: 'l1' }} title="Driver" />);

    await user.click(screen.getByRole('button'));
    await waitFor(() => expect(writeText).toHaveBeenCalled());
  });
});
