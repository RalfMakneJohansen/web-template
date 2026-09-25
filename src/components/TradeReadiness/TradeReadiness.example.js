import TradeReadiness from './TradeReadiness';
import { types as sdkTypes } from '../../util/sdkLoader';

const { UUID } = sdkTypes;

const user = (emailVerified, sender, payout) => ({
  id: new UUID('example-user'),
  type: 'currentUser',
  attributes: {
    emailVerified,
    profile: {
      firstName: 'Mette',
      lastName: 'Jensen',
      protectedData: sender
        ? {
            phoneNumber: '+45 12 34 56 78',
            senderAddress: { name: 'Mette Jensen', line1: 'Vej 1', postalCode: '2100', city: 'Kbh Ø' },
          }
        : {},
    },
  },
  ...(payout ? { stripeAccount: { id: new UUID('acct') } } : {}),
});

export const NewSeller = {
  component: TradeReadiness,
  props: { currentUser: user(false, false, false), context: 'profile' },
  group: 'fairway',
};

export const HalfwayListing = {
  component: TradeReadiness,
  props: { currentUser: user(true, true, false), context: 'listing' },
  group: 'fairway',
};

export const Ready = {
  component: TradeReadiness,
  props: { currentUser: user(true, true, true), context: 'guide' },
  group: 'fairway',
};
