/** トークン ↔ ユーザーID（メモリ保持・コールドスタートで消える可能性あり） */

import { randomUUID } from 'crypto';

function getTokenMap() {
  if (!globalThis.__shiwakeTokenMap) {
    globalThis.__shiwakeTokenMap = new Map();
  }
  return globalThis.__shiwakeTokenMap;
}

export function createToken(userId) {
  const token = randomUUID();
  getTokenMap().set(token, { userId, createdAt: Date.now() });
  return token;
}

export function resolveToken(token) {
  if (!token) return null;
  if (token === 'legacy') return { userId: 'legacy', legacy: true };
  const entry = getTokenMap().get(token);
  if (!entry) return null;
  return entry;
}
