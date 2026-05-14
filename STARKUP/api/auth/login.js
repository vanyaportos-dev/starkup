const { kv } = require('@vercel/kv');
const crypto = require('crypto');

function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

function generateToken() {
  return crypto.randomBytes(32).toString('hex');
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email и пароль обязательны' });
    }

    // Find user
    const user = await kv.get(`user:${email.toLowerCase()}`);
    if (!user) {
      return res.status(401).json({ error: 'Неверный email или пароль' });
    }

    // Check password
    const hashedPassword = hashPassword(password);
    if (user.password !== hashedPassword) {
      return res.status(401).json({ error: 'Неверный email или пароль' });
    }

    // Create session
    const token = generateToken();
    await kv.set(`session:${token}`, {
      email: email.toLowerCase(),
      expires_at: Date.now() + 7 * 24 * 60 * 60 * 1000
    });

    return res.status(200).json({
      token,
      user: { email: user.email, name: user.name, role: user.role }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
};