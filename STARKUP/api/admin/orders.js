const { kv } = require('@vercel/kv');

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const allUserEmails = await kv.smembers('users:all');
    const allOrders = [];

    for (const email of allUserEmails) {
      const orderIds = await kv.smembers(`orders:${email}`);
      for (const id of orderIds) {
        const order = await kv.get(`order:${id}`);
        if (order) allOrders.push(order);
      }
    }

    allOrders.sort((a, b) => b.created_at.localeCompare(a.created_at));
    return res.status(200).json({ orders: allOrders });
  } catch (error) {
    console.error('Admin orders error:', error);
    return res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
};