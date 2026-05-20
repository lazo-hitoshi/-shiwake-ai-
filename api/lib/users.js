/** USER_LIST 環境変数からユーザーを読み込む */

export function isAuthEnabled() {
  const raw = process.env.USER_LIST;
  return Boolean(raw && raw.trim());
}

export function loadUserList() {
  if (!isAuthEnabled()) return [];
  try {
    const list = JSON.parse(process.env.USER_LIST);
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

export function findUserByCredentials(company, password) {
  const users = loadUserList();
  return users.find(
    (u) => u.company === company && u.password === password
  ) || null;
}

export function findUserById(id) {
  const users = loadUserList();
  return users.find((u) => u.id === id) || null;
}

/** クライアントに返す安全なユーザー情報 */
export function sanitizeUser(user) {
  if (!user) return null;
  return {
    id: user.id,
    company: user.company,
    plan: user.plan,
    maxPerMonth: user.maxPerMonth,
    industry: user.industry || 'general',
    isAdmin: Boolean(user.isAdmin),
  };
}

export const PLAN_LABELS = {
  free: '無料プラン',
  light: 'ライトプラン',
  basic: 'ベーシックプラン',
  business: 'ビジネスプラン',
  pro: 'プロプラン',
  unlimited: '無制限プラン',
};

export function getPlanLabel(plan) {
  return PLAN_LABELS[plan] || plan;
}
