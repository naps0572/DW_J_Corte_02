const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

interface RequestOptions extends RequestInit {
  token?: string | null;
}

export async function apiFetch<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set('Content-Type', 'application/json');

  if (options.token) {
    headers.set('Authorization', `Bearer ${options.token}`);
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Ocurrió un error en la solicitud');
  }

  return data as T;
}
