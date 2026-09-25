import React from 'react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';

import { renderWithProviders as render, testingLibrary } from '../../../util/testHelpers';

import ShipmentTrackingMaybe from './ShipmentTrackingMaybe';

const { screen, waitFor } = testingLibrary;

const shipped = {
  shipment: { carrier: 'gls', trackingNumber: 'GLS123456', status: 'in_transit' },
};

describe('ShipmentTrackingMaybe', () => {
  it('shows the buyer where the parcel is, with a link to the carrier', () => {
    render(
      <ShipmentTrackingMaybe
        processState="purchased"
        isCustomer
        deliveryMethod="shipping"
        shipmentType="own"
        metadata={shipped}
      />
    );

    expect(screen.getByText('GLS')).toBeInTheDocument();
    expect(screen.getByText('GLS123456')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'ShipmentTracking.follow' })).toHaveAttribute(
      'href',
      'https://gls-group.com/DK/da/find-pakke?match=GLS123456'
    );
    const current = screen.getByText('ShipmentTracking.step.onTheWay').closest('li');
    expect(current).toHaveAttribute('aria-current', 'step');
    // The buyer can't change the number
    expect(screen.queryByText('ShipmentTracking.edit')).not.toBeInTheDocument();
  });

  it('shows the parcel as delivered once the order is', () => {
    render(
      <ShipmentTrackingMaybe
        processState="delivered"
        isCustomer
        deliveryMethod="shipping"
        metadata={shipped}
      />
    );
    const delivered = screen.getByText('ShipmentTracking.step.delivered').closest('li');
    expect(delivered).toHaveAttribute('aria-current', 'step');
  });

  it('asks the seller for the number while the order waits to be sent', async () => {
    const user = userEvent.setup({ delay: null });
    const onAddTracking = jest.fn(() => Promise.resolve());
    render(
      <ShipmentTrackingMaybe
        processState="purchased"
        isCustomer={false}
        deliveryMethod="shipping"
        metadata={{}}
        onAddTracking={onAddTracking}
      />
    );

    expect(screen.getByText('ShipmentTracking.addTitle')).toBeInTheDocument();
    await user.selectOptions(screen.getByLabelText('ShipmentTracking.carrierLabel'), 'postnord');
    await user.type(screen.getByLabelText('ShipmentTracking.numberLabel'), 'pn 1234 5678');
    await user.click(screen.getByRole('button', { name: 'ShipmentTracking.save' }));

    await waitFor(() =>
      expect(onAddTracking).toHaveBeenCalledWith({
        carrier: 'postnord',
        trackingNumber: 'PN12345678',
      })
    );
  });

  it('tells the seller when tracking is not switched on yet', async () => {
    const user = userEvent.setup({ delay: null });
    const onAddTracking = jest.fn(() => Promise.reject({ status: 503 }));
    render(
      <ShipmentTrackingMaybe
        processState="purchased"
        isCustomer={false}
        deliveryMethod="shipping"
        metadata={{}}
        onAddTracking={onAddTracking}
      />
    );

    await user.selectOptions(screen.getByLabelText('ShipmentTracking.carrierLabel'), 'gls');
    await user.type(screen.getByLabelText('ShipmentTracking.numberLabel'), 'GLS123456');
    await user.click(screen.getByRole('button', { name: 'ShipmentTracking.save' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('ShipmentTracking.error.notReady');
  });

  it('shows the box leg to the seller until the item is sent', () => {
    render(
      <ShipmentTrackingMaybe
        processState="purchased"
        isCustomer={false}
        deliveryMethod="shipping"
        shipmentType="box"
        metadata={{ boxShipment: { carrier: 'dao', trackingNumber: 'DAO123456' } }}
      />
    );
    expect(screen.getByText('ShipmentTracking.boxTitle.provider')).toBeInTheDocument();
    expect(screen.getByText('DAO123456')).toBeInTheDocument();
  });

  it('shows nothing for a pickup', () => {
    const { container } = render(
      <ShipmentTrackingMaybe
        processState="purchased"
        isCustomer
        deliveryMethod="pickup"
        metadata={shipped}
      />
    );
    expect(container).toBeEmptyDOMElement();
  });
});
