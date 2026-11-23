const BASE_URL = import.meta.env.VITE_API_URL || '/api';
const TOKEN_KEY = 'shiftpay.token';

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

function safeStorage(kind: 'local' | 'session'): Storage | null {
  try {
    return kind === 'local' ? window.localStorage : window.sessionStorage;
  } catch {
    return null;
  }
}

export const tokenStorage = {
  get(): string | null {
    return (
      safeStorage('local')?.getItem(TOKEN_KEY) ?? safeStorage('session')?.getItem(TOKEN_KEY) ?? null
    );
  },
  set(token: string, remember: boolean) {
    this.clear();
    safeStorage(remember ? 'local' : 'session')?.setItem(TOKEN_KEY, token);
  },
  clear() {
    safeStorage('local')?.removeItem(TOKEN_KEY);
    safeStorage('session')?.removeItem(TOKEN_KEY);
  },
};

export const UNAUTHORIZED_EVENT = 'shiftpay:unauthorized';

type Method = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

async function request<T>(method: Method, path: string, body?: unknown): Promise<T> {
  const headers: Record<string, string> = { Accept: 'application/json' };
  const token = tokenStorage.get();
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body !== undefined) headers['Content-Type'] = 'application/json';

  let response: Response;
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new ApiError(0, 'Немає зʼєднання з сервером');
  }

  const data = response.status === 204 ? null : await response.json().catch(() => null);

  if (!response.ok) {
    if (response.status === 401 && token) {
      window.dispatchEvent(new Event(UNAUTHORIZED_EVENT));
    }
    const message = (data as { message?: string } | null)?.message ?? 'Помилка запиту до сервера';
    throw new ApiError(response.status, message);
  }

  return data as T;
}

export const apiClient = {
  get: <T>(path: string) => request<T>('GET', path),
  post: <T>(path: string, body?: unknown) => request<T>('POST', path, body),
  put: <T>(path: string, body?: unknown) => request<T>('PUT', path, body),
  patch: <T>(path: string, body?: unknown) => request<T>('PATCH', path, body),
  delete: <T>(path: string) => request<T>('DELETE', path),
};

export const toApiError = (error: unknown) =>
  error instanceof ApiError ? error : new ApiError(0, 'Невідома помилка');
