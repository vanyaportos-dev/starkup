const { kv } = require('@vercel/kv');

module.exports = async function handler(req, res) {
  try {
    // GET — get user's orders
    if (req.method === 'GET') {
      const { email } = req.query;
      if (!email) {
        return res.status(400).json({ error: 'Email is required' });
      }

      const orderIds = await kv.smembers(`orders:${email.toLowerCase()}`);
      const orders = [];
      
      for (const id of orderIds) {
        const order = await kv.get(`order:${id}`);
        if (order) orders.push(order);
      }

      orders.sort((a, b) => b.created_at.localeCompare(a.created_at));
      return res.status(200).json({ orders });
    }

    // POST — create order
    if (req.method === 'POST') {
      const { orderId, email, gold, price } = req.body;

      if (!orderId || !email || !gold || !price) {
        return res.status(400).json({ error: 'Все поля обязательны' });
      }

      const order = {
        orderId,
        email: email.toLowerCase(),
        gold,
        price,
        status: 'pending',
        created_at: new Date().toISOString(),
        completed_at: null
      };

      await kv.set(`order:${orderId}`, order);
      await kv.sadd(`orders:${email.toLowerCase()}`, orderId);

      return res.status(200).json({ order });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Orders error:', error);
    return res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
};