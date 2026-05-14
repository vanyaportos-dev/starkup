const { kv } = require('@vercel/kv');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { order_id, status } = req.body;

    if (!order_id) {
      return res.status(400).json({ error: 'order_id is required' });
    }

    const order = await kv.get(`order:${order_id}`);
    if (!order) {
      return res.status(404).json({ error: 'Заказ не найден' });
    }

    if (status === 'success' || status === 'paid') {
      order.status = 'paid';
      await kv.set(`order:${order_id}`, order);
      console.log(`Order ${order_id} paid by ${order.email}`);
    }

    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
};