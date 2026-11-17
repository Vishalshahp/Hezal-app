import { describe, it, expect } from 'vitest';
import {
  base32Encode,
  base32Decode,
  generateBase32Secret,
  generateTOTP,
  verifyTOTP,
  getOtpAuthUri,
} from '../src/utils/totp.js';

describe('TOTP & Google Authenticator Utilities (RFC 6238)', () => {
  it('encodes and decodes Base32 buffers reversibly', () => {
    const original = Buffer.from('HezalMarket2026!');
    const encoded = base32Encode(original);
    expect(encoded).toMatch(/^[A-Z2-7]+$/);
    const decoded = base32Decode(encoded);
    expect(decoded.toString()).toBe('HezalMarket2026!');
  });

  it('generates valid Base32 secret string of specified length', () => {
    const secret = generateBase32Secret(20);
    expect(typeof secret).toBe('string');
    expect(secret.length).toBeGreaterThanOrEqual(32);
    expect(secret).toMatch(/^[A-Z2-7]+$/);
  });

  it('generates a 6-digit TOTP token', () => {
    const secret = 'JBSWY3DPEHPK3PXP';
    const token = generateTOTP(secret);
    expect(token).toMatch(/^\d{6}$/);
  });

  it('verifies a current valid TOTP token', () => {
    const secret = 'JBSWY3DPEHPK3PXP';
    const validToken = generateTOTP(secret, 0);
    expect(verifyTOTP(validToken, secret)).toBe(true);
  });

  it('accepts tokens within the drift window (offset +1 or -1)', () => {
    const secret = 'JBSWY3DPEHPK3PXP';
    const tokenPast = generateTOTP(secret, -1);
    const tokenFuture = generateTOTP(secret, 1);
    expect(verifyTOTP(tokenPast, secret, 1)).toBe(true);
    expect(verifyTOTP(tokenFuture, secret, 1)).toBe(true);
  });

  it('rejects expired tokens outside the drift window', () => {
    const secret = 'JBSWY3DPEHPK3PXP';
    const expiredToken = generateTOTP(secret, -5);
    expect(verifyTOTP(expiredToken, secret, 1)).toBe(false);
  });

  it('rejects invalid or malformed tokens', () => {
    const secret = 'JBSWY3DPEHPK3PXP';
    expect(verifyTOTP('12345', secret)).toBe(false);
    expect(verifyTOTP('abcdef', secret)).toBe(false);
    expect(verifyTOTP('', secret)).toBe(false);
    expect(verifyTOTP(null, secret)).toBe(false);
  });

  it('constructs standard otpauth URI for Google Authenticator QR setup', () => {
    const secret = 'JBSWY3DPEHPK3PXP';
    const uri = getOtpAuthUri('admin@hezalmarket.com', secret, 'Hezal Market');
    expect(uri).toContain('otpauth://totp/Hezal%20Market:admin%40hezalmarket.com');
    expect(uri).toContain(`secret=${secret}`);
    expect(uri).toContain('issuer=Hezal%20Market');
    expect(uri).toContain('digits=6');
  });
});
