import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';

const scrypt = promisify(scryptCallback);
const keyLength = 64;

export const hashPassword = async (password) => {
  const salt = randomBytes(16).toString('hex');
  const derivedKey = await scrypt(password, salt, keyLength);
  return `${salt}:${Buffer.from(derivedKey).toString('hex')}`;
};

export const verifyPassword = async (password, storedHash) => {
  const [salt, expectedHex] = String(storedHash).split(':');

  if (!salt || !expectedHex) {
    return false;
  }

  const derivedKey = await scrypt(password, salt, keyLength);
  const expectedKey = Buffer.from(expectedHex, 'hex');
  const actualKey = Buffer.from(derivedKey);

  if (expectedKey.length !== actualKey.length) {
    return false;
  }

  return timingSafeEqual(expectedKey, actualKey);
};
