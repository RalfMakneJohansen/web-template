import React from 'react';
import '@testing-library/jest-dom';

import { renderWithProviders as render, testingLibrary } from '../../util/testHelpers';

import OffPlatformWarning from './OffPlatformWarning';

const { screen } = testingLibrary;

describe('OffPlatformWarning', () => {
  it('warns when the message asks for MobilePay', () => {
    render(<OffPlatformWarning text="Send hellere på MobilePay" />);
    expect(screen.getByText('OffPlatformWarning.warning')).toBeInTheDocument();
  });

  it('shows the quiet note only when asked to', () => {
    const { rerender } = render(<OffPlatformWarning text="Er den ledig?" showNote />);
    expect(screen.getByText('OffPlatformWarning.note')).toBeInTheDocument();
    rerender(<OffPlatformWarning text="Er den ledig?" />);
    expect(screen.queryByText('OffPlatformWarning.note')).not.toBeInTheDocument();
  });
});
