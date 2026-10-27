export class ApiError extends Error {
  code: string;
  status: number;
  details?: any;

  constructor(message: string, code: string, status: number, details?: any) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

export async function fetchApi<T = any>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const url = path.startsWith('/api') ? path : `/api${path.startsWith('/') ? path : `/${path}`}`;

  const defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  const response = await fetch(url, {
    ...options,
    credentials: 'include', // Ensures same-origin httpOnly cookie is included
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  });

  if (response.status === 204) {
    return {} as T;
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorEnvelope = data.error || {};
    throw new ApiError(
      errorEnvelope.message || response.statusText || 'Request failed',
      errorEnvelope.code || 'UNKNOWN_ERROR',
      response.status,
      errorEnvelope.details,
    );
  }

  return data as T;
}

export const api = {
  auth: {
    login: (body: any) =>
      fetchApi('/auth/login', {
        method: 'POST',
        body: JSON.stringify(body),
      }),
    logout: () => fetchApi('/auth/logout', { method: 'POST' }),
    me: () => fetchApi('/auth/me'),
  },
};
