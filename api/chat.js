import { setCors } from './lib/cors.js';
import { isAuthEnabled, findUserById } from './lib/users.js';
import { resolveToken } from './lib/tokens.js';
import {
  checkUsageAllowed,
  recordSuccessfulProcessing,
  LIMIT_MSG_API,
} from './lib/usageStore.js';
import { checkAndReserve, incrementUsage } from './lib/usage.js';

export default async function handler(req, res) {
  setCors(res, 'POST, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({
      error: 'APIキーが設定されていません。Vercelの環境変数にANTHROPIC_API_KEYを追加してください。',
    });
  }

  const { system, messages, token, userId, plan } = req.body || {};

  let usageUser = null;
  let legacyReservation = null;

  if (isAuthEnabled()) {
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized', detail: 'ログインが必要です' });
    }

    const entry = resolveToken(token);
    if (!entry) {
      return res.status(401).json({
        error: 'セッションが無効です。再ログインしてください。',
      });
    }

    const user = findUserById(entry.userId);
    if (!user) {
      return res.status(401).json({ error: 'ユーザーが見つかりません' });
    }

    const check = await checkUsageAllowed(user);
    if (!check.allowed) {
      return res.status(429).json({
        error: check.error || LIMIT_MSG_API,
        usage: check.usage,
      });
    }

    usageUser = user;
  } else if (userId && plan) {
    legacyReservation = await checkAndReserve(userId, plan);
    if (!legacyReservation.allowed) {
      return res.status(legacyReservation.status || 429).json({
        error: legacyReservation.error,
        code: legacyReservation.code,
        usage: legacyReservation.usage,
      });
    }
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2000,
        system,
        messages,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      return res
        .status(response.status)
        .json({ error: `Anthropic API Error: ${response.status}`, detail: errText });
    }

    const data = await response.json();

    let usage = null;
    if (usageUser) {
      usage = await recordSuccessfulProcessing(usageUser);
    } else if (legacyReservation?.kvEnabled) {
      usage = await incrementUsage(legacyReservation);
    }

    return res.status(200).json({ ...data, usage });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
