import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import type { JwtPayload } from '../types';

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
  const envRounds = Number.parseInt(String(process.env.BCRYPT_SALT_ROUNDS || ''), 10);
  const saltRounds = Number.isFinite(envRounds) ? Math.min(Math.max(envRounds, 8), 15) : 12;
  const salt = await bcrypt.genSalt(saltRounds);
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

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret || !secret.trim()) {
    throw new Error('JWT_SECRET env variable is required.');
  }
  return secret;
}

function getRefreshJwtSecret(): string {
  const secret = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET;
  if (!secret || !secret.trim()) {
    throw new Error('JWT_REFRESH_SECRET (or JWT_SECRET) env variable is required.');
  }
  return secret;
}

export function getAccessTokenTtl(): string {
  return (process.env.JWT_ACCESS_TOKEN_TTL || '15m').trim();
}

export function getRefreshTokenTtl(): string {
  return (process.env.JWT_REFRESH_TOKEN_TTL || '30d').trim();
}

export function issueAccessToken(student: Pick<JwtPayload, 'sub' | 'email'>): string {
  return jwt.sign(
    { sub: Number(student.sub), email: String(student.email || '') } satisfies JwtPayload,
    getJwtSecret(),
    { expiresIn: getAccessTokenTtl() as jwt.SignOptions['expiresIn'] }
  );
}

export function issueRefreshToken(student: Pick<JwtPayload, 'sub' | 'email'>, jti: string): string {
  return jwt.sign(
    { sub: Number(student.sub), email: String(student.email || '') } satisfies JwtPayload,
    getRefreshJwtSecret(),
    {
      expiresIn: getRefreshTokenTtl() as jwt.SignOptions['expiresIn'],
      jwtid: jti,
    }
  );
}

export function verifyAccessToken(token: string): JwtPayload {
  return jwt.verify(token, getJwtSecret()) as unknown as JwtPayload;
}

export function verifyRefreshToken(token: string): (JwtPayload & { jti?: string }) {
  return jwt.verify(token, getRefreshJwtSecret()) as unknown as JwtPayload & { jti?: string };
}

export function sha256(input: string): string {
  return crypto.createHash('sha256').update(input).digest('hex');
}
