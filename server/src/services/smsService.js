import env from '../config/env.js';
import logger from '../utils/logger.js';

/**
 * Normalizes phone numbers to standard 10-digit Indian mobile format
 * e.g. "+91 98765 43210", "09876543210", "919876543210" -> "9876543210"
 * @param {string} rawPhone
 * @returns {string}
 */
export function normalizePhone(rawPhone) {
  if (!rawPhone || typeof rawPhone !== 'string') return '';
  let cleaned = rawPhone.replace(/[\s\-().+]/g, '');
  if (cleaned.startsWith('91') && cleaned.length === 12) {
    cleaned = cleaned.substring(2);
  } else if (cleaned.startsWith('0') && cleaned.length === 11) {
    cleaned = cleaned.substring(1);
  }
  return cleaned;
}

/**
 * Formats a 10-digit mobile number for display: "+91 98765 43210"
 * @param {string} phone
 * @returns {string}
 */
export function formatPhoneDisplay(phone) {
  const normalized = normalizePhone(phone);
  if (normalized.length === 10) {
    return `+91 ${normalized.slice(0, 5)} ${normalized.slice(5)}`;
  }
  return phone;
}

/**
 * Validates whether the number is a valid 10-digit Indian mobile number
 * Starting with 6, 7, 8, or 9
 * @param {string} phone
 * @returns {boolean}
 */
export function isValidPhone(phone) {
  const normalized = normalizePhone(phone);
  return /^[6-9]\d{9}$/.test(normalized);
}

/**
 * Dispatches OTP SMS via configured provider (Fast2SMS, Twilio, or Dev Simulator)
 * @param {Object} options
 * @param {string} options.phone - Recipient 10-digit phone number
 * @param {string} options.otp - 6-digit numeric OTP code
 * @param {string} [options.purpose='registration'] - Verification purpose
 * @returns {Promise<{ success: boolean, provider: string, isDevMode: boolean, devOtp?: string, message: string }>}
 */
export async function sendSmsOtp({ phone, otp, purpose = 'registration' }) {
  const normalizedPhone = normalizePhone(phone);

  if (!isValidPhone(normalizedPhone)) {
    throw new Error('Please enter a valid 10-digit mobile number (e.g. 9876543210).');
  }

  let gatewayNotice = null;

  // 1. FAST2SMS GATEWAY (Indian SMS Gateway with free signup credits & OTP route)
  if (env.FAST2SMS_API_KEY && (env.SMS_PROVIDER === 'fast2sms' || env.SMS_PROVIDER === 'auto')) {
    try {
      const response = await fetch('https://www.fast2sms.com/dev/bulkV2', {
        method: 'POST',
        headers: {
          authorization: env.FAST2SMS_API_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          route: 'otp',
          variables_values: otp,
          numbers: normalizedPhone
        })
      });

      const data = await response.json();
      if (data.return) {
        logger.info(`[Fast2SMS] OTP sent successfully to ${formatPhoneDisplay(normalizedPhone)}`);
        return {
          success: true,
          provider: 'fast2sms',
          isDevMode: false,
          message: `Verification code sent via SMS to ${formatPhoneDisplay(normalizedPhone)}.`
        };
      } else {
        const errorText = data.message || (Array.isArray(data.message) ? data.message.join(', ') : 'Gateway verification required');
        gatewayNotice = `Fast2SMS Gateway notice: ${errorText}`;
        logger.warn(`[Fast2SMS] Gateway rejected request: ${errorText}. Falling back to simulator.`);
      }
    } catch (err) {
      logger.error(`[Fast2SMS] Error contacting gateway: ${err.message}. Falling back to simulator.`);
    }
  }

  // 2. TWILIO SMS GATEWAY (International / Multi-country SMS)
  if (
    env.TWILIO_ACCOUNT_SID &&
    env.TWILIO_AUTH_TOKEN &&
    env.TWILIO_PHONE_NUMBER &&
    (env.SMS_PROVIDER === 'twilio' || env.SMS_PROVIDER === 'auto')
  ) {
    try {
      const auth = Buffer.from(`${env.TWILIO_ACCOUNT_SID}:${env.TWILIO_AUTH_TOKEN}`).toString('base64');
      const body = new URLSearchParams({
        To: `+91${normalizedPhone}`,
        From: env.TWILIO_PHONE_NUMBER,
        Body: `Your Hezal Market verification code is: ${otp}. Valid for 5 minutes. Do not share this code.`
      });

      const response = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${env.TWILIO_ACCOUNT_SID}/Messages.json`,
        {
          method: 'POST',
          headers: {
            Authorization: `Basic ${auth}`,
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: body.toString()
        }
      );

      const data = await response.json();
      if (response.ok) {
        logger.info(`[Twilio] OTP sent successfully to ${formatPhoneDisplay(normalizedPhone)}`);
        return {
          success: true,
          provider: 'twilio',
          isDevMode: false,
          message: `Verification code sent via Twilio to ${formatPhoneDisplay(normalizedPhone)}.`
        };
      } else {
        logger.warn(`[Twilio] Error: ${data.message}. Falling back to simulator.`);
      }
    } catch (err) {
      logger.error(`[Twilio] Request failed: ${err.message}. Falling back to simulator.`);
    }
  }

  // 3. SECURE DEV / DEMO SMS SIMULATOR (Instant testing without paid API keys or DLT setup)
  const isDevOrTest = env.isDevelopment || env.isTest || !env.isProduction;

  console.log('\n┌────────────────────────────────────────────────────────────────────────┐');
  console.log('│ 📱 [HEZAL MARKET SMS GATEWAY - ACTIVE DEMO SIMULATOR]                   │');
  console.log(`│ Recipient: ${formatPhoneDisplay(normalizedPhone).padEnd(58)}│`);
  console.log(`│ Verification OTP: [ ${otp} ] (Valid for 5 minutes)${' '.repeat(27)}│`);
  console.log(`│ Purpose: ${purpose.padEnd(60)}│`);
  console.log('│ Note: Set FAST2SMS_API_KEY in .env to deliver real SMS to mobile phones. │');
  console.log('└────────────────────────────────────────────────────────────────────────┘\n');

  logger.info(`[SMS Simulator] OTP for ${normalizedPhone} is ${otp}`);

  return {
    success: true,
    provider: 'simulator',
    isDevMode: isDevOrTest,
    devOtp: isDevOrTest ? otp : undefined,
    message: `Verification code generated for ${formatPhoneDisplay(normalizedPhone)}.`
  };
}

export default {
  normalizePhone,
  formatPhoneDisplay,
  isValidPhone,
  sendSmsOtp
};
