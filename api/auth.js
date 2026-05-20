import { setCors } from './lib/cors.js';
import {
  isAuthEnabled,
  findUserByCredentials,
  sanitizeUser,
} from './lib/users.js';
import { createToken } from './lib/tokens.js';

export default async function handler(req, res) {
  setCors(res, 'POST, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { company, password } = req.body || {};

  if (!isAuthEnabled()) {
    const token = createToken('legacy');
    return res.status(200).json({
      success: true,
      legacy: true,
      user: {
        id: 'legacy',
        company: 'ゲスト',
        plan: 'free',
        maxPerMonth: 10,
        industry: 'general',
        isAdmin: false,
      },
      token,
    });
  }

  if (!company || !password) {
    return res.status(400).json({
      success: false,
      error: '会社名とパスワードを入力してください',
    });
  }

  const user = findUserByCredentials(company, password);
  if (!user) {
    return res.status(401).json({
      success: false,
      error: '会社名またはパスワードが違います',
    });
  }

  const token = createToken(user.id);
  return res.status(200).json({
    success: true,
    user: sanitizeUser(user),
    token,
  });
}
