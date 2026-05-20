// サーバー側の月間利用制限（改ざん防止）
// Vercel KV がある場合のみ永続化。未設定時はプラン検証のみ。

const PLAN_LIMITS = { free: 10, light: 50, basic: 150 };

const LIMIT_MSG = '今月の処理枚数を使い切りました';
const GLOBAL_MSG =
  'サービスの今月の利用上限に達しました。しばらくしてからお試しください。';

function getMonthKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function getGlobalCap() {
  const n = parseInt(process.env.MONTHLY_GLOBAL_CAP || '200', 10);
  return Number.isFinite(n) && n > 0 ? n : 200;
}

function kvConfigured() {
  return Boolean(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);
}

async function getKv() {
  if (!kvConfigured()) return null;
  const { kv } = await import('@vercel/kv');
  return kv;
}

function validatePlan(plan) {
  return plan && Object.prototype.hasOwnProperty.call(PLAN_LIMITS, plan);
}

export function getPlanLimit(plan) {
  return PLAN_LIMITS[plan] ?? PLAN_LIMITS.free;
}

/** 現在の利用状況を取得（カウントしない） */
export async function getUsageStatus(userId, plan) {
  if (!userId || !validatePlan(plan)) {
    return { ok: false, error: 'userId または plan が不正です', status: 400 };
  }

  const month = getMonthKey();
  const limit = getPlanLimit(plan);
  const globalCap = getGlobalCap();

  if (!kvConfigured()) {
    return {
      ok: true,
      kvEnabled: false,
      month,
      plan,
      used: null,
      limit,
      globalCap,
      globalUsed: null,
      remaining: null,
      reached: false,
    };
  }

  const kv = await getKv();
  const userKey = `usage:user:${userId}:${month}`;
  const globalKey = `usage:global:${month}`;

  const [used, globalUsed] = await Promise.all([
    kv.get(userKey).then((v) => Number(v) || 0),
    kv.get(globalKey).then((v) => Number(v) || 0),
  ]);

  const userReached = used >= limit;
  const globalReached = globalUsed >= globalCap;

  return {
    ok: true,
    kvEnabled: true,
    month,
    plan,
    used,
    limit,
    globalCap,
    globalUsed,
    remaining: Math.max(0, limit - used),
    reached: userReached || globalReached,
    userReached,
    globalReached,
  };
}

/** API呼び出し前にチェック。通過したら increment 用のキーを返す */
export async function checkAndReserve(userId, plan) {
  const status = await getUsageStatus(userId, plan);
  if (!status.ok) return { allowed: false, error: status.error, status: status.status };

  if (!status.kvEnabled) {
    return {
      allowed: true,
      kvEnabled: false,
      usage: { used: null, limit: status.limit, remaining: null },
    };
  }

  if (status.globalReached) {
    return {
      allowed: false,
      error: GLOBAL_MSG,
      status: 429,
      code: 'GLOBAL_LIMIT',
      usage: {
        used: status.used,
        limit: status.limit,
        remaining: 0,
        globalUsed: status.globalUsed,
        globalCap: status.globalCap,
      },
    };
  }

  if (status.userReached) {
    return {
      allowed: false,
      error: LIMIT_MSG,
      status: 429,
      code: 'USER_LIMIT',
      usage: {
        used: status.used,
        limit: status.limit,
        remaining: 0,
      },
    };
  }

  return {
    allowed: true,
    kvEnabled: true,
    userKey: `usage:user:${userId}:${status.month}`,
    globalKey: `usage:global:${status.month}`,
    usage: {
      used: status.used,
      limit: status.limit,
      remaining: status.remaining,
    },
  };
}

/** Anthropic API 成功後にカウント +1 */
export async function incrementUsage(reservation) {
  if (!reservation?.kvEnabled) return null;

  const kv = await getKv();
  const [userUsed, globalUsed] = await Promise.all([
    kv.incr(reservation.userKey),
    kv.incr(reservation.globalKey),
  ]);

  const limit = reservation.usage?.limit ?? PLAN_LIMITS.free;

  return {
    used: userUsed,
    limit,
    remaining: Math.max(0, limit - userUsed),
    globalUsed,
    globalCap: getGlobalCap(),
  };
}

export { LIMIT_MSG, GLOBAL_MSG, PLAN_LIMITS, getGlobalCap };
