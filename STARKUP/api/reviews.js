const { kv } = require('@vercel/kv');

module.exports = async function handler(req, res) {
  try {
    // GET — get all reviews
    if (req.method === 'GET') {
      const reviewIds = await kv.smembers('reviews:all');
      const reviews = [];
      
      for (const id of reviewIds) {
        const review = await kv.get(`review:${id}`);
        if (review) reviews.push(review);
      }

      reviews.sort((a, b) => b.created_at.localeCompare(a.created_at));
      return res.status(200).json({ reviews });
    }

    // POST — create review
    if (req.method === 'POST') {
      const { email, name, stars, comment } = req.body;

      if (!email || !stars || !comment) {
        return res.status(400).json({ error: 'Email, stars and comment are required' });
      }

      const reviewId = `review_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const review = {
        reviewId,
        email: email.toLowerCase(),
        name: name || email,
        stars: parseInt(stars),
        comment,
        created_at: new Date().toISOString()
      };

      await kv.set(`review:${reviewId}`, review);
      await kv.sadd('reviews:all', reviewId);

      return res.status(200).json({ review });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Reviews error:', error);
    return res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
};