import { verifyEmail } from './emailVerification.duck';

describe('verifyEmail', () => {
  const run = sdk => {
    // Nested thunks (the user reload) are only recorded, not run
    const dispatch = jest.fn(action => action);
    const getState = () => ({ emailVerification: { verificationInProgress: false } });
    return verifyEmail('token-123')(dispatch, getState, sdk);
  };

  it('notes when the email was confirmed', async () => {
    const sdk = {
      currentUser: {
        verifyEmail: jest.fn(() => Promise.resolve({})),
        updateProfile: jest.fn(() => Promise.resolve({})),
        show: jest.fn(() => Promise.resolve({ data: { data: {}, included: [] } })),
      },
    };
    const result = await run(sdk);

    expect(sdk.currentUser.verifyEmail).toHaveBeenCalledWith({ verificationToken: 'token-123' });
    const [params] = sdk.currentUser.updateProfile.mock.calls[0];
    expect(typeof params.privateData.emailVerifiedAt).toBe('string');
    expect(result.payload).toBe(true);
  });

  it('still counts as verified if noting the date fails', async () => {
    const sdk = {
      currentUser: {
        verifyEmail: jest.fn(() => Promise.resolve({})),
        updateProfile: jest.fn(() => Promise.reject(new Error('nope'))),
        show: jest.fn(() => Promise.resolve({ data: { data: {}, included: [] } })),
      },
    };
    const result = await run(sdk);
    expect(result.payload).toBe(true);
  });
});
