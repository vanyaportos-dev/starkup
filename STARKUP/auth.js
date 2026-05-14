// ============================================
// STARKUP — Auth Functions
// ============================================

const API_BASE = '/api';

const AUTH_TOKEN_KEY = 'starkup_token';
const AUTH_USER_KEY = 'starkup_user';

// Get current user from localStorage
function getCurrentUser() {
  const userJson = localStorage.getItem(AUTH_USER_KEY);
  if (!userJson) return null;
  try {
    return JSON.parse(userJson);
  } catch(e) {
    return null;
  }
}

// Get auth token
function getAuthToken() {
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

// Check if user is authenticated
async function checkAuth() {
  const token = getAuthToken();
  if (!token) return null;
  
  try {
    const response = await fetch(`${API_BASE}/auth/me`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (response.ok) {
      const data = await response.json();
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(data.user));
      return data.user;
    } else {
      localStorage.removeItem(AUTH_TOKEN_KEY);
      localStorage.removeItem(AUTH_USER_KEY);
      return null;
    }
  } catch(e) {
    return null;
  }
}

// Login
async function login(email, password) {
  const response = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  
  const data = await response.json();
  
  if (response.ok && data.token) {
    localStorage.setItem(AUTH_TOKEN_KEY, data.token);
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(data.user));
    window.location.href = '/dashboard';
  } else {
    throw new Error(data.error || 'Ошибка входа');
  }
}

// Register
async function register(name, email, password) {
  const response = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password })
  });
  
  const data = await response.json();
  
  if (response.ok && data.token) {
    localStorage.setItem(AUTH_TOKEN_KEY, data.token);
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(data.user));
    window.location.href = '/dashboard';
  } else {
    throw new Error(data.error || 'Ошибка регистрации');
  }
}

// Logout
async function logout() {
  const token = getAuthToken();
  if (token) {
    await fetch(`${API_BASE}/auth/logout`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });
  }
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_USER_KEY);
  window.location.href = '/';
}

// Protect page (call on dashboard/admin pages)
async function requireAuth() {
  const user = await checkAuth();
  if (!user) {
    window.location.href = '/login';
    return null;
  }
  return user;
}
