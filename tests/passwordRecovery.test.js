import { describe, test, expect } from 'bun:test';
import { passwordRecoveryRedirect, requestPasswordRecovery, validateRecoveryPassword, hasRecoveryLink } from '../src/lib/passwordRecovery';

describe('password recovery rules', () => {
  test('reset redirects to the requesting app origin plus /reset-password', () => {
    expect(passwordRecoveryRedirect('https://pageconsult.app')).toBe('https://pageconsult.app/reset-password');
  });
  test('minimum is exactly six characters', () => {
    expect(validateRecoveryPassword('12345', '12345')).not.toBeNull();
    expect(validateRecoveryPassword('123456', '123456')).toBeNull();
  });
  test('confirmation must match', () => {
    expect(validateRecoveryPassword('123456', '654321')).not.toBeNull();
  });
  test('existing, unknown, and failed requests have indistinguishable results', async () => {
    const responses = [{ data: {}, error: null }, { data: {}, error: { message: 'Unknown account' } }];
    for (const response of responses) {
      expect(await requestPasswordRecovery({ resetPasswordForEmail: async (email, options) => {
        expect(email).toBe('test@example.com');
        expect(options.redirectTo).toBe('https://pageconsult.app/reset-password');
        return response;
      } }, ' test@example.com ', 'https://pageconsult.app')).toBeUndefined();
    }
    expect(await requestPasswordRecovery({ resetPasswordForEmail: async () => { throw new Error('Network'); } }, 'test@example.com', 'https://pageconsult.app')).toBeUndefined();
  });
  test('normal sessions and error links are not recovery links', () => {
    expect(hasRecoveryLink('https://pageconsult.app/reset-password')).toBe(false);
    expect(hasRecoveryLink('https://pageconsult.app/reset-password#type=recovery&error=expired')).toBe(false);
    expect(hasRecoveryLink('https://pageconsult.app/reset-password#type=recovery&access_token=test')).toBe(true);
    expect(hasRecoveryLink('https://pageconsult.app/reset-password?code=test')).toBe(true);
  });
});