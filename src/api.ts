export const apiConfig = {
  baseUrl: process.env.EXPO_PUBLIC_API_URL ?? 'https://gmbl-1.onrender.com',
};

export class ApiError extends Error {
  status: number;
  details: { path: string; method: string; baseUrl: string; payload: unknown } | null;

  constructor(message: string, status: number, details: { path: string; method: string; baseUrl: string; payload: unknown } | null = null) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

type RequestOptions = {
  method?: 'GET' | 'POST';
  token?: string | null;
  body?: unknown;
};

export const apiRequest = async <T>(path: string, options: RequestOptions = {}): Promise<T> => {
  const response = await fetch(`${apiConfig.baseUrl}${path}`, {
    method: options.method ?? 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const payload = (await response.json().catch(() => null)) as { error?: string } | null;

  if (!response.ok) {
    throw new ApiError(payload?.error ?? 'Request failed.', response.status, {
      path,
      method: options.method ?? 'GET',
      baseUrl: apiConfig.baseUrl,
      payload,
    });
  }

  return payload as T;
};
