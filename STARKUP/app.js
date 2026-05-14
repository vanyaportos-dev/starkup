// ============================================
// STARKUP — Common Functions
// ============================================

const API_BASE = '/api';

// Navigation
document.addEventListener('DOMContentLoaded', () => {
  // Highlight active nav link
  const currentPath = window.location.pathname;
  document.querySelectorAll('.nav-links a').forEach(link => {
    if (link.getAttribute('href') === currentPath) {
      link.style.color = '#FFFFFF';
    }
  });
});

// Toast notification
function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `<span>${message}</span>`;
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(20px)';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// Toast styles (injected dynamically)
(function() {
  const style = document.createElement('style');
  style.textContent = `
    .toast {
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 9999;
      padding: 16px 24px;
      border-radius: var(--radius-md);
      font-family: var(--font);
      font-size: 14px;
      font-weight: 500;
      color: #FFFFFF;
      transition: all 0.3s ease;
      max-width: 400px;
    }
    .toast-success { background: var(--success); color: #000; }
    .toast-error { background: var(--danger); }
    .toast-info { background: var(--accent); }
  `;
  document.head.appendChild(style);
})();