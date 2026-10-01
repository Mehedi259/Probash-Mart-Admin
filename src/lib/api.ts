/**
 * Probash Mart Admin — API Client
 * Handles all HTTP requests to the Django REST backend with JWT auth.
 */

import { API_V1 } from './config';

// ─── Token Management ──────────────────────────────────────────────────────
function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('access_token');
}

function getRefreshToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('refresh_token');
}

export function setTokens(access: string, refresh: string) {
  localStorage.setItem('access_token', access);
  localStorage.setItem('refresh_token', refresh);
}

export function clearTokens() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    if (window.location.pathname !== '/login') {
      window.location.href = '/login';
    }
  }
}

export function isAuthenticated(): boolean {
  return !!getAccessToken();
}

// ─── Core Fetch Wrapper ────────────────────────────────────────────────────
async function refreshAccessToken(): Promise<string | null> {
  const refresh = getRefreshToken();
  if (!refresh) return null;

  try {
    const res = await fetch(`${API_V1}/auth/token/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh }),
    });
    if (!res.ok) {
      clearTokens();
      return null;
    }
    const data = await res.json();
    localStorage.setItem('access_token', data.access);
    return data.access;
  } catch {
    clearTokens();
    return null;
  }
}

interface FetchOptions extends RequestInit {
  requireAuth?: boolean;
}

async function apiFetch<T = any>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> {
  const { requireAuth = true, headers: customHeaders, ...rest } = options;

  // Strip trailing slash before query parameters to avoid Next.js 308 redirect 
  // (which can drop Authorization headers on POST requests).
  endpoint = endpoint.replace(/\/(\?|$)/, '$1');

  const headers: Record<string, string> = {
    ...(customHeaders as Record<string, string>),
  };

  // Don't set Content-Type for FormData (browser sets it with boundary)
  if (!(rest.body instanceof FormData)) {
    headers['Content-Type'] = headers['Content-Type'] || 'application/json';
  }

  if (requireAuth) {
    const token = getAccessToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  let res = await fetch(`${API_V1}${endpoint}`, { ...rest, headers });

  // If 401, try refreshing token once
  if (res.status === 401 && requireAuth) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      headers['Authorization'] = `Bearer ${newToken}`;
      res = await fetch(`${API_V1}${endpoint}`, { ...rest, headers });
    }
  }

  if (res.status === 204) return undefined as T;

  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(error.detail || error.message || JSON.stringify(error));
  }

  const text = await res.text();
  const replacedText = text.replace(new RegExp('http://46.225.103.236:8003', 'g'), '');
  return JSON.parse(replacedText) as T;
}

// ─── Public API Methods ────────────────────────────────────────────────────

// Auth
export const authAPI = {
  login: (email: string, password: string) =>
    apiFetch('/auth/login/', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
      requireAuth: false,
    }),
  logout: () =>
    apiFetch('/auth/logout/', {
      method: 'POST',
      body: JSON.stringify({ refresh: getRefreshToken() }),
    }),
  getProfile: () => apiFetch('/auth/profile/'),
  updateProfile: (data: any) =>
    apiFetch('/auth/profile/', { method: 'PUT', body: JSON.stringify(data) }),
  changePassword: (data: any) =>
    apiFetch('/auth/change-password/', { method: 'POST', body: JSON.stringify(data) }),
};

// Dashboard / Analytics
export const analyticsAPI = {
  getDashboard: () => apiFetch('/analytics/dashboard/'),
  getSales: (period?: string) =>
    apiFetch(`/analytics/sales/${period ? `?period=${period}` : ''}`),
  getOrdersByStatus: () => apiFetch('/analytics/orders-by-status/'),
  getTopProducts: (limit = 5) => apiFetch(`/analytics/top-products/?limit=${limit}`),
  getOverview: () => apiFetch('/analytics/overview/'),
};

// Products
export const productsAPI = {
  list: (params?: string) => apiFetch(`/products/admin/list/${params ? `?${params}` : ''}`),
  get: (id: string) => apiFetch(`/products/admin/${id}/`),
  create: (data: any) =>
    apiFetch('/products/admin/list/', { method: 'POST', body: data instanceof FormData ? data : JSON.stringify(data) }),
  update: (id: string, data: any) =>
    apiFetch(`/products/admin/${id}/`, { method: 'PUT', body: data instanceof FormData ? data : JSON.stringify(data) }),
  delete: (id: string) =>
    apiFetch(`/products/admin/${id}/`, { method: 'DELETE' }),
  uploadImage: (productId: string, formData: FormData) =>
    apiFetch(`/products/admin/${productId}/images/`, { method: 'POST', body: formData }),
};

// Categories
export const categoriesAPI = {
  list: () => apiFetch('/categories/', { requireAuth: false }),
  adminList: (params?: string) => apiFetch(`/categories/admin/list/${params ? `?${params}` : ''}`),
  get: (id: string) => apiFetch(`/categories/admin/${id}/`),
  create: (data: any) =>
    apiFetch('/categories/admin/list/', { method: 'POST', body: data instanceof FormData ? data : JSON.stringify(data) }),
  update: (id: string, data: any) =>
    apiFetch(`/categories/admin/${id}/`, { method: 'PUT', body: data instanceof FormData ? data : JSON.stringify(data) }),
  delete: (id: string) =>
    apiFetch(`/categories/admin/${id}/`, { method: 'DELETE' }),
};

// Orders
export const ordersAPI = {
  list: (params?: string) => apiFetch(`/orders/admin/list/${params ? `?${params}` : ''}`),
  get: (id: string) => apiFetch(`/orders/admin/${id}/`),
  updateStatus: (id: string, status: string) =>
    apiFetch(`/orders/admin/${id}/`, { method: 'PUT', body: JSON.stringify({ status }) }),
};

// Customers
export const customersAPI = {
  list: (params?: string) => apiFetch(`/auth/customers/${params ? `?${params}` : ''}`),
};

// Coupons
export const couponsAPI = {
  list: (params?: string) => apiFetch(`/coupons/admin/list/${params ? `?${params}` : ''}`),
  get: (id: string) => apiFetch(`/coupons/admin/${id}/`),
  create: (data: any) =>
    apiFetch('/coupons/admin/list/', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) =>
    apiFetch(`/coupons/admin/${id}/`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) =>
    apiFetch(`/coupons/admin/${id}/`, { method: 'DELETE' }),
};

// Reviews
export const reviewsAPI = {
  list: (params?: string) => apiFetch(`/reviews/admin/list/${params ? `?${params}` : ''}`),
  moderate: (id: string, status: string) =>
    apiFetch(`/reviews/admin/${id}/moderate/`, { method: 'PUT', body: JSON.stringify({ status }) }),
  delete: (id: string) =>
    apiFetch(`/reviews/admin/${id}/delete/`, { method: 'DELETE' }),
};

// Banners
export const bannersAPI = {
  list: (params?: string) => apiFetch(`/banners/admin/list/${params ? `?${params}` : ''}`),
  get: (id: string) => apiFetch(`/banners/admin/${id}/`),
  create: (data: any) =>
    apiFetch('/banners/admin/list/', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) =>
    apiFetch(`/banners/admin/${id}/`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) =>
    apiFetch(`/banners/admin/${id}/`, { method: 'DELETE' }),
};

// Blog
export const blogAPI = {
  list: (params?: string) => apiFetch(`/blog/admin/list/${params ? `?${params}` : ''}`),
  get: (id: string) => apiFetch(`/blog/admin/${id}/`),
  create: (data: any) =>
    apiFetch('/blog/admin/list/', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) =>
    apiFetch(`/blog/admin/${id}/`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) =>
    apiFetch(`/blog/admin/${id}/`, { method: 'DELETE' }),
};

// Pages
export const pagesAPI = {
  list: (params?: string) => apiFetch(`/pages/admin/list/${params ? `?${params}` : ''}`),
  get: (id: string) => apiFetch(`/pages/admin/${id}/`),
  create: (data: any) =>
    apiFetch('/pages/admin/list/', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) =>
    apiFetch(`/pages/admin/${id}/`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) =>
    apiFetch(`/pages/admin/${id}/`, { method: 'DELETE' }),
};

// Transactions
export const transactionsAPI = {
  list: (params?: string) => apiFetch(`/payments/transactions/${params ? `?${params}` : ''}`),
  get: (id: string) => apiFetch(`/payments/transactions/${id}/`),
};

// Payment Methods
export const paymentMethodsAPI = {
  list: () => apiFetch('/payments/methods/', { requireAuth: false }),
  get: (id: string) => apiFetch(`/payments/methods/${id}/`),
  create: (data: any) =>
    apiFetch('/payments/methods/', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) =>
    apiFetch(`/payments/methods/${id}/`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) =>
    apiFetch(`/payments/methods/${id}/`, { method: 'DELETE' }),
};

// Shipping
export const shippingAPI = {
  list: () => apiFetch('/shipping/', { requireAuth: false }),
  adminList: (params?: string) => apiFetch(`/shipping/admin/list/${params ? `?${params}` : ''}`),
  get: (id: string) => apiFetch(`/shipping/admin/${id}/`),
  create: (data: any) =>
    apiFetch('/shipping/admin/list/', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) =>
    apiFetch(`/shipping/admin/${id}/`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) =>
    apiFetch(`/shipping/admin/${id}/`, { method: 'DELETE' }),
};

// Users (Admin)
export const usersAPI = {
  list: (params?: string) => apiFetch(`/auth/users/${params ? `?${params}` : ''}`),
  get: (id: string) => apiFetch(`/auth/users/${id}/`),
  create: (data: any) =>
    apiFetch('/auth/users/', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) =>
    apiFetch(`/auth/users/${id}/`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) =>
    apiFetch(`/auth/users/${id}/`, { method: 'DELETE' }),
};

// Contact Messages
export const contactAPI = {
  list: (params?: string) => apiFetch(`/contact/admin/list/${params ? `?${params}` : ''}`),
  get: (id: string) => apiFetch(`/contact/admin/${id}/`),
  update: (id: string, data: any) =>
    apiFetch(`/contact/admin/${id}/`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) =>
    apiFetch(`/contact/admin/${id}/`, { method: 'DELETE' }),
};

// Newsletter
export const newsletterAPI = {
  list: (params?: string) => apiFetch(`/newsletter/admin/list/${params ? `?${params}` : ''}`),
};
