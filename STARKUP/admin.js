// ============================================
// STARKUP — Admin Logic
// ============================================

let allOrders = [];
let currentFilter = 'all';

(async function() {
  const user = await requireAuth();
  if (!user || user.role !== 'admin') {
    alert('Доступ запрещён');
    window.location.href = '/';
    return;
  }

  await loadOrders();
})();

async function loadOrders() {
  try {
    // Load all users' orders (admin only — would need a separate endpoint)
    const users = await fetch('/api/admin/orders').then(r => r.json()).catch(() => ({ orders: [] }));
    allOrders = users.orders || [];
    renderOrders();
  } catch (err) {
    console.error('Admin error:', err);
    document.getElementById('adminOrdersBody').innerHTML = 
      '<tr><td colspan="7" style="text-align:center;padding:40px;color:var(--danger);">Ошибка загрузки</td></tr>';
  }
}

function filterOrders(filter, btn) {
  currentFilter = filter;
  document.querySelectorAll('.btn-filter').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  renderOrders();
}

function renderOrders() {
  const tbody = document.getElementById('adminOrdersBody');
  let orders = allOrders;
  
  if (currentFilter !== 'all') {
    orders = orders.filter(o => o.status === currentFilter);
  }

  if (orders.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:40px;">Нет заказов</td></tr>';
    return;
  }

  tbody.innerHTML = orders.map(o => `
    <tr>
      <td><code>${o.orderId}</code></td>
      <td>${o.email}</td>
      <td>${o.gold}G</td>
      <td>${o.price}₽</td>
      <td><span class="status-badge status-${o.status}">${o.status}</span></td>
      <td>${new Date(o.created_at).toLocaleString()}</td>
      <td>
        ${o.status === 'paid' ? `
          <button class="btn-sm btn-success" onclick="updateOrder('${o.orderId}', 'completed')">✅ Выполнить</button>
          <button class="btn-sm btn-danger" onclick="updateOrder('${o.orderId}', 'cancelled')">❌ Отменить</button>
        ` : '—'}
      </td>
    </tr>
  `).join('');
}

async function updateOrder(orderId, status) {
  try {
    await fetch(`/api/orders/${orderId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    
    const order = allOrders.find(o => o.orderId === orderId);
    if (order) order.status = status;
    renderOrders();
  } catch (err) {
    alert('Ошибка обновления заказа');
  }
}