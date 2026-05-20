// GET /api/usage?userId=xxx&plan=free
import { getUsageStatus } from './lib/usage.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const { userId, plan } = req.query;
  const status = await getUsageStatus(userId, plan);

  if (!status.ok) {
    return res.status(status.status || 400).json({ error: status.error });
  }

  return res.status(200).json({
    kvEnabled: status.kvEnabled,
    month: status.month,
    plan: status.plan,
    used: status.used,
    limit: status.limit,
    remaining: status.remaining,
    reached: status.reached,
    globalCap: status.globalCap,
    globalUsed: status.globalUsed,
  });
}
