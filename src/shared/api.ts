/**
 * Backend API base URL — configurable for device/emulator LAN access.
 * Web dev: localhost:4000. Native: set VITE_API_URL or replace at build time.
 */
const DEFAULT_API = 'http://localhost:4000';

export function getApiBaseUrl(): string {
  if (typeof globalThis !== 'undefined') {
    const env = (globalThis as any).process?.env?.VITE_API_URL
      || (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_API_URL);
    if (env && typeof env === 'string') return env.replace(/\/$/, '');
  }
  return DEFAULT_API;
}

export function apiUrl(path: string): string {
  const base = getApiBaseUrl();
  return `${base}${path.startsWith('/') ? path : `/${path}`}`;
}