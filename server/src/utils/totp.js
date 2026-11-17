import crypto from 'crypto';

// Base32 character set (RFC 4648 standard for Google Authenticator)
const BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

/**
 * Decode a Base32 string into a Buffer
 * @param {string} base32Str 
 * @returns {Buffer}
 */
export function base32Decode(base32Str) {
  const cleanStr = base32Str.toUpperCase().replace(/[\s=-]/g, '');
  let bits = '';
  for (let i = 0; i < cleanStr.length; i++) {
    const val = BASE32_ALPHABET.indexOf(cleanStr[i]);
    if (val === -1) continue;
    bits += val.toString(2).padStart(5, '0');
  }

  const bytes = [];
  for (let i = 0; i + 8 <= bits.length; i += 8) {
    bytes.push(parseInt(bits.substring(i, i + 8), 2));
  }
  return Buffer.from(bytes);
}

/**
 * Encode a Buffer into a Base32 string
 * @param {Buffer} buffer 
 * @returns {string}
 */
export function base32Encode(buffer) {
  let bits = '';
  for (let i = 0; i < buffer.length; i++) {
    bits += buffer[i].toString(2).padStart(8, '0');
  }

  let base32 = '';
  for (let i = 0; i < bits.length; i += 5) {
    const chunk = bits.substring(i, i + 5).padEnd(5, '0');
    base32 += BASE32_ALPHABET[parseInt(chunk, 2)];
  }
  return base32;
}

/**
 * Generate a random Base32 secret for Google Authenticator (default: 20 bytes = 32 Base32 chars)
 * @param {number} [byteLength=20]
 * @returns {string}
 */
export function generateBase32Secret(byteLength = 20) {
  const randomBytes = crypto.randomBytes(byteLength);
  return base32Encode(randomBytes);
}

/**
 * Calculate the 6-digit TOTP token for a given Base32 secret and time step offset
 * RFC 6238 Standard (HMAC-SHA1, 30s step, 6 digits)
 * @param {string} secret - Base32 encoded secret
 * @param {number} [timeStepOffset=0] - Offset in 30-second steps (-1, 0, +1)
 * @param {number} [timeStepSeconds=30]
 * @returns {string} - 6-digit code with leading zeros
 */
export function generateTOTP(secret, timeStepOffset = 0, timeStepSeconds = 30) {
  const key = base32Decode(secret);
  const epoch = Math.floor(Date.now() / 1000);
  const counter = Math.floor(epoch / timeStepSeconds) + timeStepOffset;

  const counterBuffer = Buffer.alloc(8);
  // Write 64-bit integer big-endian
  counterBuffer.writeBigInt64BE(BigInt(counter), 0);

  const hmac = crypto.createHmac('sha1', key);
  hmac.update(counterBuffer);
  const digest = hmac.digest();

  // Dynamic truncation (RFC 4226)
  const offset = digest[digest.length - 1] & 0x0f;
  const binary =
    ((digest[offset] & 0x7f) << 24) |
    ((digest[offset + 1] & 0xff) << 16) |
    ((digest[offset + 2] & 0xff) << 8) |
    (digest[offset + 3] & 0xff);

  const otp = binary % 1000000;
  return otp.toString().padStart(6, '0');
}

/**
 * Verify a 6-digit TOTP token against a Base32 secret with drift window
 * @param {string} token - 6-digit code provided by user
 * @param {string} secret - Base32 encoded user secret
 * @param {number} [window=1] - Number of 30-second steps to check before and after (±1 step = 90s window)
 * @returns {boolean}
 */
export function verifyTOTP(token, secret, window = 1) {
  if (!token || !secret) return false;
  const cleanToken = token.toString().trim().replace(/\s+/g, '');
  if (!/^\d{6}$/.test(cleanToken)) return false;

  for (let offset = -window; offset <= window; offset++) {
    const expected = generateTOTP(secret, offset);
    if (crypto.timingSafeEqual(Buffer.from(cleanToken), Buffer.from(expected))) {
      return true;
    }
  }
  return false;
}

/**
 * Generate standard otpauth:// URI for Google Authenticator QR codes
 * @param {string} email
 * @param {string} secret
 * @param {string} [issuer='Hezal Market']
 * @returns {string}
 */
export function getOtpAuthUri(email, secret, issuer = 'Hezal Market') {
  const encodedIssuer = encodeURIComponent(issuer);
  const encodedAccount = encodeURIComponent(email);
  return `otpauth://totp/${encodedIssuer}:${encodedAccount}?secret=${secret}&issuer=${encodedIssuer}&algorithm=SHA1&digits=6&period=30`;
}

export default {
  base32Decode,
  base32Encode,
  generateBase32Secret,
  generateTOTP,
  verifyTOTP,
  getOtpAuthUri,
};
