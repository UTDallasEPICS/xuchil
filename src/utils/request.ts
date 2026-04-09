export interface RequestOptions {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  url: string;
  query?: Record<string, string | number | boolean>;
  body?: any;
}

export async function sendRequest({ method, url, query, body}: RequestOptions) {
  const fullUrl = new URL(url);
  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      fullUrl.searchParams.set(key, String(value));
    })
  }

  const response = await fetch(fullUrl, {
    method,
    headers: {
      ...(body ? { 'Content-Type': 'application/json'} : undefined),
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  return response;
}