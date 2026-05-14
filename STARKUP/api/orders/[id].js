const { kv } = require('@vercel/kv');

module.exports = async function handler(req, res) {
  const { id } = req.query;

  try {
    // GET — get order status
    if (req.method === 'GET') {
      const order = await kv.get(`order:${id}`);
      if (!order) {
        return res.status(404).json({ error: 'Заказ не найден' });
      }
      return res.status(200).json(order);
    }

    // PATCH — update order status (admin only)
    if (req.method === 'PATCH') {
      const { status } = req.body;
      
      if (!status) {
        return res.status(400).json({ error: 'Status is required' });
      }

      const order = await kv.get(`order:${id}`);
      if (!order) {
        return res.status(404).json({ error: 'Заказ не найден' });
      }

      order.status = status;
      if (status === 'completed') {
        order.completed_at = new Date().toISOString();
      }
      
      await kv.set(`order:${id}`, order);
      return res.status(200).json(order);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Order error:', error);
    return res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
};