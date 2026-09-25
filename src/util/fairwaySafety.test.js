import { mentionsOffPlatformPayment } from './fairwaySafety';

describe('mentionsOffPlatformPayment', () => {
  it('spots payment outside Fairway', () => {
    expect(mentionsOffPlatformPayment('Kan du ikke bare sende på MobilePay?')).toBe(true);
    expect(mentionsOffPlatformPayment('Jeg tager gerne bankoverførsel')).toBe(true);
    expect(mentionsOffPlatformPayment('reg nr 1234 og kontonummer følger')).toBe(true);
  });

  it('spots Danish phone numbers', () => {
    expect(mentionsOffPlatformPayment('ring på 12 34 56 78')).toBe(true);
    expect(mentionsOffPlatformPayment('+45 12345678')).toBe(true);
    expect(mentionsOffPlatformPayment('sms 12-34-56-78')).toBe(true);
  });

  it('leaves ordinary golf talk alone', () => {
    expect(mentionsOffPlatformPayment('Er den stadig ledig? Jeg byder 1200 kr.')).toBe(false);
    expect(mentionsOffPlatformPayment('Købt i 2021, stiff flex, 10.5 grader')).toBe(false);
    expect(mentionsOffPlatformPayment('')).toBe(false);
    expect(mentionsOffPlatformPayment(undefined)).toBe(false);
  });
});
