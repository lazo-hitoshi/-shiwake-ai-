// /api/chat.js
// Vercel Serverless Function
// APIキーはサーバー側（環境変数）に保管 → ユーザーには見えない

import { checkAndReserve, incrementUsage } from './lib/usage.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({
      error: 'APIキーが設定されていません。Vercelの環境変数にANTHROPIC_API_KEYを追加してください。',
    });
  }

  const { system, messages, userId, plan } = req.body || {};

  // ★ サーバー側で月間枚数をチェック（改ざん防止）
  const reservation = await checkAndReserve(userId, plan);
  if (!reservation.allowed) {
    return res.status(reservation.status || 429).json({
      error: reservation.error,
      code: reservation.code,
      usage: reservation.usage,
    });
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

    // 成功時のみカウント（APIコストが発生した分だけ）
    const usage = await incrementUsage(reservation);

    return res.status(200).json({ ...data, usage });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
