/**
 * Probash Mart Admin — Centralized API configuration
 * Points to the Django REST Framework backend.
 */

// Always use relative URL so Next.js rewrites proxy the request to the backend.
// This prevents mixed-content errors in the browser and works identically in dev/prod.
export const API_BASE_URL = '';

export const API_V1 = '/api/v1';
