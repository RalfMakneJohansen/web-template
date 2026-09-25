import FairwayFooter from './FairwayFooter';

// The social icons only show once their addresses are set in SOCIAL_LINKS;
// this shows how they will look.
export const WithSocialProfiles = {
  component: FairwayFooter,
  props: {
    socialLinks: {
      facebook: 'https://www.facebook.com/',
      instagram: 'https://www.instagram.com/',
    },
  },
  group: 'fairway',
};
