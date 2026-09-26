import { verificationScreen } from './EmailVerificationPage';

const base = {
  hasUser: true,
  token: 'abc',
  isVerified: false,
  inProgress: false,
  error: null,
  emailVerified: false,
  pendingEmail: null,
};

describe('verificationScreen', () => {
  it('waits for the user', () => {
    expect(verificationScreen({ ...base, hasUser: false })).toBe('loading');
  });

  it('shows the check while the link is being used', () => {
    expect(verificationScreen({ ...base, inProgress: true })).toBe('verifying');
    expect(verificationScreen(base)).toBe('verifying');
  });

  it('says so when it worked', () => {
    expect(verificationScreen({ ...base, isVerified: true })).toBe('verified');
  });

  it('treats an old link on a verified account as done, not failed', () => {
    expect(verificationScreen({ ...base, error: { status: 409 }, emailVerified: true })).toBe(
      'verified'
    );
  });

  it('offers a new link when it failed', () => {
    expect(verificationScreen({ ...base, error: { status: 409 } })).toBe('failed');
    expect(
      verificationScreen({
        ...base,
        error: { status: 409 },
        emailVerified: true,
        pendingEmail: 'new@x.dk',
      })
    ).toBe('failed');
  });

  it('asks to check the inbox without a link', () => {
    expect(verificationScreen({ ...base, token: null })).toBe('checkInbox');
  });
});
