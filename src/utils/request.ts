export interface RequestOptions {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  url: string;
  query?: Record<string, string | number | boolean | undefined>;
  body?: unknown;
}

export async function sendRequest({ method, url, query, body}: RequestOptions) {
  const fullUrl = new URL(url);
  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null) fullUrl.searchParams.set(key, String(value));
    });
  }

  const res = await fetch(fullUrl.toString(), {
    method,
    credentials: 'include',
    headers: {
      ...(body ? { 'Content-Type': 'application/json' } : undefined),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    // try to parse JSON error body
    const text = await res.text();
    try {
      const parsed = JSON.parse(text);
      const message = parsed && (parsed.message || parsed.error) ? (parsed.message || parsed.error) : text;
      throw new Error(message || res.statusText || 'Request failed');
    } catch {
      throw new Error(text || res.statusText || 'Request failed');
    }
  }

  // Attempt to parse JSON; if empty body, return null
  const txt = await res.text();
  if (!txt) return null;
  try {
    return JSON.parse(txt);
  } catch {
    return txt;
  }
}