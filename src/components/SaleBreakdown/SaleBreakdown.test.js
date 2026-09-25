import React from 'react';
import '@testing-library/jest-dom';

import { renderWithProviders as render, testingLibrary } from '../../util/testHelpers';

import SaleBreakdown, { formatKr } from './SaleBreakdown';

const { screen } = testingLibrary;

describe('SaleBreakdown', () => {
  it('formats whole kroner with a Danish thousands separator', () => {
    expect(formatKr(130988)).toBe('1.310 kr.');
    expect(formatKr(5000)).toBe('50 kr.');
    expect(formatKr(0)).toBe('0 kr.');
  });

  it('shows the payout and every line for a shipped item', () => {
    render(<SaleBreakdown priceSubunits={120000} shipmentType="own" />);

    expect(screen.getAllByText('1.200 kr.')).toHaveLength(2); // payout and price
    expect(screen.getByText('60 kr.')).toBeInTheDocument(); // fee
    expect(screen.getByText('50 kr.')).toBeInTheDocument(); // freight
    expect(screen.getByText('1.310 kr.')).toBeInTheDocument(); // buyer total
  });

  it('shows no freight for a meetup', () => {
    render(<SaleBreakdown priceSubunits={120000} shipmentType="meetup" />);

    expect(screen.getByText('SaleBreakdown.noFreight')).toBeInTheDocument();
    expect(screen.getByText('1.260 kr.')).toBeInTheDocument();
  });

  it('takes the box from the payout but not from the buyer', () => {
    render(<SaleBreakdown priceSubunits={120000} shipmentType="box" />);

    expect(screen.getByText('1.141 kr.')).toBeInTheDocument(); // payout
    expect(screen.getByText('SaleBreakdown.boxNote')).toBeInTheDocument();
    expect(screen.getByText('1.310 kr.')).toBeInTheDocument(); // buyer total unchanged
  });

  it('renders nothing before a price is typed', () => {
    const { container } = render(<SaleBreakdown priceSubunits={0} />);
    expect(container).toBeEmptyDOMElement();
  });
});
