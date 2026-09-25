import SaleBreakdown from './SaleBreakdown';

export const Shipped = {
  component: SaleBreakdown,
  props: { priceSubunits: 120000, shipmentType: 'own' },
  group: 'fairway',
};

export const Pickup = {
  component: SaleBreakdown,
  props: { priceSubunits: 249500, shipmentType: 'meetup' },
  group: 'fairway',
};
