import DeliveryInfo from './DeliveryInfo';

export const OwnBox = {
  component: DeliveryInfo,
  props: { publicData: { shipment_type: 'own' } },
  group: 'fairway',
};

export const FairwayBox = {
  component: DeliveryInfo,
  props: { publicData: { shipment_type: 'box' } },
  group: 'fairway',
};

export const Meetup = {
  component: DeliveryInfo,
  props: { publicData: { shipment_type: 'meetup' } },
  group: 'fairway',
};
