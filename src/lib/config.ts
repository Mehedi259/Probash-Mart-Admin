/**
 * Probash Mart Admin — Centralized API configuration
 * Points to the Django REST Framework backend.
 */

// Use the Hetzner server API in production, localhost in dev
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const API_V1 = `${API_BASE_URL}/api/v1`;
