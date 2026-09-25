import OffPlatformWarning from './OffPlatformWarning';

export const Warning = {
  component: OffPlatformWarning,
  props: { text: 'Kan du ikke bare sende på MobilePay? Ring på 12 34 56 78' },
  group: 'fairway',
};

export const Note = {
  component: OffPlatformWarning,
  props: { text: 'Er den stadig ledig?', showNote: true },
  group: 'fairway',
};
