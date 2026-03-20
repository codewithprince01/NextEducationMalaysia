import bcrypt from 'bcryptjs';
import crypto from 'crypto';

/**
 * Generate a 6-digit random OTP.
 */
export function generateOtp(): number {
  return crypto.randomInt(100000, 999999);
}

/**
 * Hash a plain text password using bcrypt.
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

/**
 * Verify a plain text password against a hashed password.
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  try {
    return await bcrypt.compare(password, hash);
  } catch (err) {
    console.error('Password verification error:', err);
    return false;
  }
}
