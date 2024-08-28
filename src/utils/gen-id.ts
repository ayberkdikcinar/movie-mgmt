import { randomBytes } from 'crypto';

export function generateUUID() {
  return randomBytes(12).toString('hex');
}
