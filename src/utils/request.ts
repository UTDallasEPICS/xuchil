import qs from 'qs';

export interface RequestOptions {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  url: string;
  query?: unknown;
  body?: unknown;
}

export async function sendRequest({method, url, query, body}: RequestOptions) {
  const fullUrl = new URL(url, window.location.origin);
  if (query) {
    fullUrl.search = qs.stringify(query);
  }

  const res = await fetch(fullUrl.toString(), {
    method,
    credentials: 'include',
    headers: {
      ...(body ? {'Content-Type': 'application/json'} : undefined),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    throw new Error(await res.json());
  }

  if (res.status != 204) {
    return await res.json();
  }
}