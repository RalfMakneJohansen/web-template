import React from 'react';
import '@testing-library/jest-dom';

import { renderWithProviders as render, testingLibrary } from '../../util/testHelpers';

import DeliveryInfo, { deliveryTypeOf } from './DeliveryInfo';

const { screen } = testingLibrary;

describe('DeliveryInfo', () => {
  it('reads the shipping choice, and falls back for older listings', () => {
    expect(deliveryTypeOf({ shipment_type: 'box' })).toBe('box');
    expect(deliveryTypeOf({ shippingEnabled: true })).toBe('own');
    expect(deliveryTypeOf({ pickupEnabled: true, shippingEnabled: false })).toBe('meetup');
    expect(deliveryTypeOf({})).toBeNull();
  });

  it('tells the buyer the slower delivery for a Fairway box', () => {
    render(<DeliveryInfo publicData={{ shipment_type: 'box' }} />);
    expect(screen.getByText('DeliveryInfo.box.title')).toBeInTheDocument();
  });

  it('renders nothing for a listing that neither ships nor meets', () => {
    const { container } = render(<DeliveryInfo publicData={{}} />);
    expect(container).toBeEmptyDOMElement();
  });
});
