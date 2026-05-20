import { setCors } from './lib/cors.js';
import { isAuthEnabled, findUserById } from './lib/users.js';
import { resolveToken } from './lib/tokens.js';
import {
  getUserUsage,
  incrementUserUsage,
  getAdminUsageReport,
  getMonthKey,
} from './lib/usageStore.js';

async function userFromToken(token) {
  const entry = resolveToken(token);
  if (!entry) return { error: 'セッションが無効です。再ログインしてください。', status: 401 };

  if (entry.legacy || !isAuthEnabled()) {
    return {
      user: {
        id: 'legacy',
        maxPerMonth: 10,
        isAdmin: false,
      },
    };
  }

  const user = findUserById(entry.userId);
  if (!user) return { error: 'ユーザーが見つかりません', status: 401 };
  return { user };
}

export default async function handler(req, res) {
  setCors(res, 'GET, POST, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method === 'GET') {
    const { token, admin } = req.query;
    if (!token) return res.status(400).json({ error: 'token が必要です' });

    const resolved = await userFromToken(token);
    if (resolved.error) return res.status(resolved.status).json({ error: resolved.error });

    if (admin === 'true') {
      if (!resolved.user.isAdmin) {
        return res.status(403).json({ error: '管理者権限が必要です' });
      }
      const report = await getAdminUsageReport();
      return res.status(200).json(report);
    }

    const usage = await getUserUsage(resolved.user.id, resolved.user.maxPerMonth);
    return res.status(200).json(usage);
  }

  if (req.method === 'POST') {
    const { token, count = 1 } = req.body || {};
    if (!token) return res.status(400).json({ error: 'token が必要です' });

    const resolved = await userFromToken(token);
    if (resolved.error) return res.status(resolved.status).json({ error: resolved.error });

    const used = await incrementUserUsage(resolved.user.id, Number(count) || 1);
    const max = Number(resolved.user.maxPerMonth) || 0;
    return res.status(200).json({
      used,
      max,
      remaining: Math.max(0, max - used),
      month: getMonthKey(),
    });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
