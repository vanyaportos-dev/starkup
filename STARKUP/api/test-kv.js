module.exports = async function handler(req, res) {
  res.json({
    KV_REST_API_URL: process.env.KV_REST_API_URL ? '✅ Есть' : '❌ Нет',
    KV_REST_API_TOKEN: process.env.KV_REST_API_TOKEN ? '✅ Есть' : '❌ Нет',
    KV_URL: process.env.KV_URL ? '✅ Есть' : '❌ Нет',
    KV_REST_API_READ_ONLY_TOKEN: process.env.KV_REST_API_READ_ONLY_TOKEN ? '✅ Есть' : '❌ Нет',
    // Покажем первые 10 символов каждой переменной (безопасно)
    KV_REST_API_URL_preview: process.env.KV_REST_API_URL ? process.env.KV_REST_API_URL.substring(0, 30) + '...' : 'Нет',
    NODE_ENV: process.env.NODE_ENV || 'Не задано'
  });
};
