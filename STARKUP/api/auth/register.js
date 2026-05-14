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
    const { name, email, password } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Все поля обязательны' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Пароль должен быть не менее 6 символов' });
    }

    // Check if user exists
    const existingUser = await kv.get(`user:${email.toLowerCase()}`);
    if (existingUser) {
      return res.status(400).json({ error: 'Пользователь с таким email уже существует' });
    }

    // Create user
    const hashedPassword = hashPassword(password);
    const user = {
      email: email.toLowerCase(),
      password: hashedPassword,
      name: name,
      role: 'user',
      created_at: new Date().toISOString()
    };

    await kv.set(`user:${email.toLowerCase()}`, user);
    await kv.sadd('users:all', email.toLowerCase());

    // Create admin if first user
    const adminSettings = await kv.get('admin:settings');
    if (!adminSettings) {
      await kv.set('admin:settings', { admin_emails: [email.toLowerCase()] });
      user.role = 'admin';
      await kv.set(`user:${email.toLowerCase()}`, user);
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
    console.error('Register error:', error);
    return res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
};