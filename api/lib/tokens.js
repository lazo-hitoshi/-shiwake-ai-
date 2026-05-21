/**
 * 署名付きトークン（どのサーバーでも検証可能）
 * ※ メモリ保持は Vercel Serverless では別インスタンスで消えるため不使用
 */

import { createHmac } from 'crypto';

const TOKEN_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000; // 30日

function getAuthSecret() {
  return (
    process.env.AUTH_SECRET ||
    process.env.ANTHROPIC_API_KEY ||
    'shiwake-fallback-secret-change-me'
  );
}

function sign(payloadB64) {
  return createHmac('sha256', getAuthSecret()).update(payloadB64).digest('base64url');
}

export function createToken(userId) {
  const payload = Buffer.from(
    JSON.stringify({ uid: userId, ts: Date.now() })
  ).toString('base64url');
  return `${payload}.${sign(payload)}`;
}

export function resolveToken(token) {
  if (!token) return null;
  if (token === 'legacy') return { userId: 'legacy', legacy: true };

  const dot = token.lastIndexOf('.');
  if (dot < 1) return null;

  const payload = token.slice(0, dot);
  const sig = token.slice(dot + 1);

  if (sig !== sign(payload)) return null;

  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    if (!data?.uid) return null;
    if (data.ts && Date.now() - data.ts > TOKEN_MAX_AGE_MS) return null;
    return { userId: data.uid };
  } catch {
    return null;
  }
}
