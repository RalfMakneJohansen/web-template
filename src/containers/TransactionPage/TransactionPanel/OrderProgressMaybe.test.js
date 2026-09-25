import React from 'react';
import '@testing-library/jest-dom';

import { renderWithProviders as render, testingLibrary } from '../../../util/testHelpers';

import OrderProgressMaybe, { progressStepFor } from './OrderProgressMaybe';

const { screen } = testingLibrary;

describe('OrderProgressMaybe', () => {
  it('picks the step from delivery method, shipping choice and box metadata', () => {
    expect(progressStepFor({ deliveryMethod: 'pickup' })).toBe('meetup');
    expect(progressStepFor({ deliveryMethod: 'shipping', shipmentType: 'own' })).toBe('own');
    expect(progressStepFor({ deliveryMethod: 'shipping', shipmentType: 'box' })).toBe('boxComing');
    expect(
      progressStepFor({
        deliveryMethod: 'shipping',
        shipmentType: 'box',
        metadata: { boxDispatchedAt: '2026-09-25T09:00:00Z' },
      })
    ).toBe('boxOnItsWay');
    expect(progressStepFor({ deliveryMethod: 'none' })).toBeNull();
  });

  it('shows the seller the box tracking once the box is sent', () => {
    render(
      <OrderProgressMaybe
        processState="purchased"
        isCustomer={false}
        deliveryMethod="shipping"
        shipmentType="box"
        metadata={{ boxDispatchedAt: '2026-09-25T09:00:00Z', boxTracking: 'TT123' }}
      />
    );
    expect(screen.getByText('OrderProgress.boxOnItsWay.provider.title')).toBeInTheDocument();
    expect(screen.getByText('OrderProgress.tracking')).toBeInTheDocument();
  });

  it('tells the buyer of a meetup to arrange it and confirm receipt', () => {
    render(
      <OrderProgressMaybe processState="purchased" isCustomer deliveryMethod="pickup" />
    );
    expect(screen.getByText('OrderProgress.meetup.customer.text')).toBeInTheDocument();
  });

  it('reminds the buyer of the 48 hours once the item is on its way', () => {
    render(<OrderProgressMaybe processState="delivered" isCustomer deliveryMethod="shipping" />);
    expect(screen.getByText('OrderProgress.inspection.customer.text')).toBeInTheDocument();
  });

  it('says nothing once the order is completed', () => {
    const { container } = render(
      <OrderProgressMaybe processState="completed" isCustomer deliveryMethod="shipping" />
    );
    expect(container).toBeEmptyDOMElement();
  });
});
