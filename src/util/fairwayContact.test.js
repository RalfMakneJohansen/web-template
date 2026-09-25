import {
  getTradeReadiness,
  normalisePhone,
  senderInitialValues,
  senderProfileUpdate,
} from './fairwayContact';

const user = ({ emailVerified = true, protectedData = {}, stripeAccount } = {}) => ({
  id: { uuid: 'user-1' },
  attributes: {
    emailVerified,
    profile: { firstName: 'Mette', lastName: 'Jensen', protectedData },
  },
  ...(stripeAccount ? { stripeAccount } : {}),
});

const fullSender = {
  phoneNumber: '+45 12 34 56 78',
  senderAddress: {
    name: 'Mette Jensen',
    line1: 'Vejnavn 12',
    postalCode: '2100',
    city: 'København Ø',
    country: 'DK',
  },
};

describe('getTradeReadiness', () => {
  it('is ready to sell only with email, sender address and payout account', () => {
    const ready = getTradeReadiness(
      user({ protectedData: fullSender, stripeAccount: { id: { uuid: 'acct' } } })
    );
    expect(ready).toEqual({
      emailVerified: true,
      senderAddress: true,
      payoutAccount: true,
      readyToSell: true,
    });
  });

  it('reports each missing piece on its own', () => {
    const fresh = getTradeReadiness(user({ emailVerified: false }));
    expect(fresh).toEqual({
      emailVerified: false,
      senderAddress: false,
      payoutAccount: false,
      readyToSell: false,
    });
  });

  it('does not count a sender address without a phone number', () => {
    const noPhone = { senderAddress: fullSender.senderAddress };
    expect(getTradeReadiness(user({ protectedData: noPhone })).senderAddress).toBe(false);
  });

  it('handles a missing user', () => {
    expect(getTradeReadiness(null).readyToSell).toBe(false);
  });
});

describe('sender address helpers', () => {
  it('prefills the form from the profile, falling back to the account name', () => {
    expect(senderInitialValues(user()).senderName).toBe('Mette Jensen');
    expect(senderInitialValues(user({ protectedData: fullSender }))).toEqual({
      senderName: 'Mette Jensen',
      senderLine1: 'Vejnavn 12',
      senderPostal: '2100',
      senderCity: 'København Ø',
      senderPhone: '+45 12 34 56 78',
    });
  });

  it('stores trimmed values and one phone format', () => {
    const update = senderProfileUpdate({
      senderName: ' Ole Hansen ',
      senderLine1: 'Gade 3 ',
      senderPostal: ' 8000',
      senderCity: 'Aarhus C',
      senderPhone: '87654321',
    });
    expect(update).toEqual({
      protectedData: {
        senderAddress: {
          name: 'Ole Hansen',
          line1: 'Gade 3',
          postalCode: '8000',
          city: 'Aarhus C',
          country: 'DK',
        },
        phoneNumber: '+45 87 65 43 21',
      },
    });
  });

  it('normalises phone numbers', () => {
    expect(normalisePhone('+4512345678')).toBe('+45 12 34 56 78');
  });
});
