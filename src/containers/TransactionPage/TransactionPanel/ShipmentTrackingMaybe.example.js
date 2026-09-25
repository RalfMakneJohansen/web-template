import ShipmentTrackingMaybe from './ShipmentTrackingMaybe';

const noop = () => Promise.resolve();

export const BuyerParcelOnItsWay = {
  component: ShipmentTrackingMaybe,
  props: {
    processState: 'purchased',
    isCustomer: true,
    deliveryMethod: 'shipping',
    shipmentType: 'own',
    metadata: {
      shipment: {
        carrier: 'gls',
        trackingNumber: '00370712345678901234',
        status: 'in_transit',
        updatedAt: '2026-09-25T12:03:00Z',
        events: [
          { at: '2026-09-25T12:03:00Z', text: 'Pakken er på vej', location: 'Brøndby' },
          { at: '2026-09-24T16:40:00Z', text: 'Afleveret i pakkeshop', location: 'Aarhus C' },
        ],
      },
    },
  },
  group: 'transaction',
};

export const SellerAddsTracking = {
  component: ShipmentTrackingMaybe,
  props: {
    processState: 'purchased',
    isCustomer: false,
    deliveryMethod: 'shipping',
    shipmentType: 'own',
    metadata: {},
    onAddTracking: noop,
  },
  group: 'transaction',
};

export const SellerBoxOnItsWay = {
  component: ShipmentTrackingMaybe,
  props: {
    processState: 'purchased',
    isCustomer: false,
    deliveryMethod: 'shipping',
    shipmentType: 'box',
    metadata: {
      boxShipment: { carrier: 'dao', trackingNumber: 'DAO7654321', status: 'ready_for_pickup' },
    },
    onAddTracking: noop,
  },
  group: 'transaction',
};
