export const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

async function request<T>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: res.statusText }));
    const err = new Error(error.message || `Request failed: ${res.status}`) as any;
    err.status = res.status;
    throw err;
  }

  return res.json() as Promise<T>;
}

export const apiClient = {
  get:    <T>(path: string, options?: RequestInit) =>
            request<T>(path, { method: 'GET', ...options }),
  post:   <T>(path: string, body: unknown, options?: RequestInit) =>
            request<T>(path, { method: 'POST',  body: JSON.stringify(body), ...options }),
  put:    <T>(path: string, body: unknown, options?: RequestInit) =>
            request<T>(path, { method: 'PUT',   body: JSON.stringify(body), ...options }),
  patch:  <T>(path: string, body: unknown, options?: RequestInit) =>
            request<T>(path, { method: 'PATCH', body: JSON.stringify(body), ...options }),
  delete: <T>(path: string, options?: RequestInit) =>
            request<T>(path, { method: 'DELETE', ...options }),
};
