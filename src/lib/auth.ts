import crypto from 'crypto';

const AUTH_SECRET = process.env.AUTH_SECRET || 'ams_rentcar_secure_auth_secret_key_2026';
export const ADMIN_COOKIE_NAME = 'admin_session';

/**
 * Hash a plain password using SHA-256 with a random cryptographic salt.
 * Output format: sha256$SALT$HASH
 */
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.createHmac('sha256', salt).update(password).digest('hex');
  return `sha256$${salt}$${hash}`;
}

/**
 * Verify a plain password against a stored hash (or legacy plaintext).
 */
export function verifyPassword(password: string, storedHashOrPlain?: string): boolean {
  if (!storedHashOrPlain) return false;

  // 1. Check if stored in sha256$salt$hash format
  if (storedHashOrPlain.startsWith('sha256$')) {
    const parts = storedHashOrPlain.split('$');
    if (parts.length !== 3) return false;
    const salt = parts[1];
    const originalHash = parts[2];
    const computedHash = crypto.createHmac('sha256', salt).update(password).digest('hex');
    return crypto.timingSafeEqual(Buffer.from(originalHash), Buffer.from(computedHash));
  }

  // 2. Legacy plaintext fallback (e.g., initial 'admin123')
  return password === storedHashOrPlain;
}

/**
 * Generate a signed session token.
 * Valid for 7 days by default.
 */
export function createSessionToken(username: string, daysValid = 7): string {
  const exp = Math.floor(Date.now() / 1000) + daysValid * 24 * 60 * 60;
  const payloadObj = { u: username, exp };
  const payloadStr = Buffer.from(JSON.stringify(payloadObj)).toString('base64url');
  const signature = crypto.createHmac('sha256', AUTH_SECRET).update(payloadStr).digest('base64url');
  return `${payloadStr}.${signature}`;
}

/**
 * Verify signed session token.
 */
export function verifySessionToken(token?: string | null): { valid: boolean; username?: string } {
  if (!token || !token.includes('.')) {
    return { valid: false };
  }

  try {
    const [payloadStr, signature] = token.split('.');
    if (!payloadStr || !signature) return { valid: false };

    const expectedSignature = crypto.createHmac('sha256', AUTH_SECRET).update(payloadStr).digest('base64url');
    if (signature !== expectedSignature) {
      return { valid: false };
    }

    const payloadJson = Buffer.from(payloadStr, 'base64url').toString('utf-8');
    const payload = JSON.parse(payloadJson);

    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return { valid: false }; // expired
    }

    return { valid: true, username: payload.u || 'admin' };
  } catch {
    return { valid: false };
  }
}
