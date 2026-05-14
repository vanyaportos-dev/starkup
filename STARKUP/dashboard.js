// ============================================
// STARKUP — Dashboard Logic
// ============================================

(async function() {
  const user = await requireAuth();
  if (!user) return;

  document.getElementById('userName').textContent = `👤 ${user.name}`;

  try {
    const response = await fetch(`/api/orders?email=${encodeURIComponent(user.email)}`);
    const data = await response.json();
    const orders = data.orders || [];

    // Stats
    const completedOrders = orders.filter(o => o.status === 'completed');
    const totalSpent = orders.reduce((sum, o) => sum + o.price, 0);
    const totalGold = orders.reduce((sum, o) => sum + o.gold, 0);

    document.getElementById('totalOrders').textContent = orders.length;
    document.getElementById('totalSpent').textContent = `${totalSpent}₽`;
    document.getElementById('totalGold').textContent = `${totalGold}G`;

    // Table
    const tbody = document.getElementById('ordersBody');
    if (orders.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:var(--text-muted);padding:40px;">У вас пока нет заказов</td></tr>';
    } else {
      tbody.innerHTML = orders.map(o => `
        <tr>
          <td><code style="font-size:12px;">${o.orderId}</code></td>
          <td>${new Date(o.created_at).toLocaleDateString()}</td>
          <td>${o.gold}G</td>
          <td>${o.price}₽</td>
          <td><span class="status-badge status-${o.status}">${statusText(o.status)}</span></td>
        </tr>
      `).join('');
    }
  } catch (err) {
    console.error('Dashboard error:', err);
  }
})();

function statusText(status) {
  const map = {
    'pending': '⏳ Ожидает',
    'paid': '💳 Оплачен',
    'completed': '✅ Выполнен',
    'cancelled': '❌ Отменён'
  };
  return map[status] || status;
}