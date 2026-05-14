const { kv } = require('@vercel/kv');

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Не авторизован' });
    }

    const token = authHeader.split(' ')[1];
    const session = await kv.get(`session:${token}`);

    if (!session || session.expires_at < Date.now()) {
      return res.status(401).json({ error: 'Сессия истекла' });
    }

    const user = await kv.get(`user:${session.email}`);
    if (!user) {
      return res.status(401).json({ error: 'Пользователь не найден' });
    }

    return res.status(200).json({
      user: { email: user.email, name: user.name, role: user.role }
    });
  } catch (error) {
    console.error('Me error:', error);
    return res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
};