export interface ApiCall {
  method: string;
  path: string;
  body?: unknown;
}

interface ApiFailure {
  method: string;
  path: string;
  status: number;
  message: string;
  times: number;
}

export const apiLog: ApiCall[] = [];
export const apiFailures: ApiFailure[] = [];

export const apiCalls = (method: string, path: string) =>
  apiLog.filter((call) => call.method === method && call.path.startsWith(path));

export function failApi(
  method: string,
  path: string,
  message = 'Сервер недоступний',
  status = 500,
  times = 1
) {
  apiFailures.push({ method, path, status, message, times });
}

export function takeFailure(method: string, path: string) {
  const failure = apiFailures.find(
    (f) => f.times > 0 && f.method === method && path.startsWith(f.path)
  );
  if (!failure) return null;
  failure.times -= 1;
  if (failure.status === 0) throw new TypeError('Failed to fetch');
  return new Response(JSON.stringify({ message: failure.message }), { status: failure.status });
}
