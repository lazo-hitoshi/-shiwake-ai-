/** 月間利用枚数（KV 優先、なければ /tmp/usage.json） */

import { loadUserList, sanitizeUser } from './users.js';

const TMP_PATH = '/tmp/usage.json';
const LIMIT_MSG = '今月の処理枚数を使い切りました';
const LIMIT_MSG_API = '今月の処理枚数上限に達しました';

function getMonthKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function kvConfigured() {
  return Boolean(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);
}

async function getKv() {
  if (!kvConfigured()) return null;
  const { kv } = await import('@vercel/kv');
  return kv;
}

function storageKey(month) {
  return `usage:month:${month}`;
}

async function readMonthData(month) {
  const kv = await getKv();
  if (kv) {
    const data = await kv.get(storageKey(month));
    if (data && typeof data === 'object') return data;
    return { month, users: {} };
  }

  try {
    const fs = await import('fs/promises');
    const raw = await fs.readFile(TMP_PATH, 'utf8');
    const all = JSON.parse(raw);
    if (all.month !== month) return { month, users: {} };
    return all;
  } catch {
    return { month, users: {} };
  }
}

async function writeMonthData(data) {
  const kv = await getKv();
  if (kv) {
    await kv.set(storageKey(data.month), data);
    return;
  }
  try {
    const fs = await import('fs/promises');
    await fs.writeFile(TMP_PATH, JSON.stringify(data), 'utf8');
  } catch {
    /* /tmp 書き込み不可時はスキップ */
  }
}

export async function getUserUsage(userId, maxPerMonth) {
  const month = getMonthKey();
  const data = await readMonthData(month);
  const used = Number(data.users?.[userId]) || 0;
  const max = Number(maxPerMonth) || 0;
  const remaining = Math.max(0, max - used);
  return {
    used,
    max,
    remaining,
    month,
    reached: max > 0 && used >= max,
  };
}

export async function incrementUserUsage(userId, count = 1) {
  const month = getMonthKey();
  const data = await readMonthData(month);
  if (data.month !== month) {
    data.month = month;
    data.users = {};
  }
  data.users[userId] = (Number(data.users[userId]) || 0) + count;
  await writeMonthData(data);
  return data.users[userId];
}

export async function getAdminUsageReport() {
  const month = getMonthKey();
  const data = await readMonthData(month);
  const users = loadUserList();
  const rows = users
    .filter((u) => !u.isAdmin)
    .map((u) => {
      const used = Number(data.users?.[u.id]) || 0;
      const max = Number(u.maxPerMonth) || 0;
      return {
        id: u.id,
        company: u.company,
        plan: u.plan,
        industry: u.industry,
        used,
        max,
        remaining: Math.max(0, max - used),
        percent: max > 0 ? Math.round((used / max) * 100) : 0,
      };
    });

  const totalUsed = rows.reduce((s, r) => s + r.used, 0);
  const estimatedCostYen = totalUsed * 5;

  return {
    month,
    users: rows,
    totalUsed,
    estimatedCostYen,
  };
}

export async function checkUsageAllowed(user) {
  const status = await getUserUsage(user.id, user.maxPerMonth);
  if (status.reached) {
    return {
      allowed: false,
      error: LIMIT_MSG_API,
      usage: status,
    };
  }
  return { allowed: true, usage: status };
}

export async function recordSuccessfulProcessing(user) {
  const used = await incrementUserUsage(user.id, 1);
  const max = Number(user.maxPerMonth) || 0;
  return {
    used,
    max,
    remaining: Math.max(0, max - used),
    month: getMonthKey(),
  };
}

export { LIMIT_MSG, LIMIT_MSG_API, getMonthKey };
