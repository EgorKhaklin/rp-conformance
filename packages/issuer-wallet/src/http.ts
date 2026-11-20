// HTTP messages as the issuance client builds them, and the evidence of each exchange (issuer harness design section
// 5.1: every request and response with headers). A request is plain data until it is sent, so a hook can replace or
// change it after its valid build.

/** The steps of `SCN-M` and `SCN-I` the client runs, as recorded in the evidence. */
export type IssuanceStep = 'offer' | 'metadata' | 'metadata-jwt' | 'token' | 'nonce' | 'credential';

/** A request before it is sent. */
export interface HttpRequestMessage {
  method: string;
  url: string;
  headers: Record<string, string>;
  body?: string;
}

/** A response as received; header names in lower case. */
export interface HttpResponseRecord {
  status: number;
  headers: Record<string, string>;
  body: string;
}

/** One request and its response. `attempt` counts the sends of one step, 2 for the retry after `use_dpop_nonce`. */
export interface HttpExchange {
  step: IssuanceStep;
  attempt: number;
  at: string;
  request: HttpRequestMessage;
  response?: HttpResponseRecord;
  /** Set when no response arrived. */
  error?: string;
}

/** Changes a request after its valid build and before it is sent (the seam of the fault layer, issue 18). */
export type RequestHook = (step: IssuanceStep, request: HttpRequestMessage) => HttpRequestMessage | Promise<HttpRequestMessage>;

export const headersOf = (headers: Headers): Record<string, string> => Object.fromEntries([...headers.entries()]);

/** Sends a request, records the exchange in `log`, and returns the response record (body read as text). */
export async function send(step: IssuanceStep, request: HttpRequestMessage, log: HttpExchange[], attempt = 1): Promise<HttpResponseRecord> {
  const exchange: HttpExchange = { step, attempt, at: new Date().toISOString(), request };
  log.push(exchange);
  try {
    const response = await fetch(request.url, { method: request.method, headers: request.headers, body: request.body, redirect: 'manual' });
    exchange.response = { status: response.status, headers: headersOf(response.headers), body: await response.text() };
    return exchange.response;
  } catch (error) {
    exchange.error = (error as Error).message;
    throw error;
  }
}

/**
 * A `fetch` for the libraries (offer and metadata resolution): it turns their request into an `HttpRequestMessage`,
 * applies the hook, sends it through `send` and hands the libraries a fresh `Response` over the recorded body.
 */
export function recordingFetch(step: () => IssuanceStep, log: HttpExchange[], hook?: RequestHook): typeof fetch {
  return async (input, init) => {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
    const headers = headersOf(new Headers(init?.headers ?? (input instanceof Request ? input.headers : undefined)));
    let request: HttpRequestMessage = {
      method: init?.method ?? 'GET',
      url,
      headers,
      ...(typeof init?.body === 'string' ? { body: init.body } : init?.body instanceof URLSearchParams ? { body: init.body.toString() } : {}),
    };
    if (hook) request = await hook(step(), request);
    const record = await send(step(), request, log);
    return new Response(record.status === 204 || record.status === 304 ? null : record.body, { status: record.status, headers: record.headers });
  };
}

/** The JSON body of a response, or undefined when it is not JSON. */
export function jsonOf(response: HttpResponseRecord): Record<string, unknown> | undefined {
  try {
    const value = JSON.parse(response.body) as unknown;
    return value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : undefined;
  } catch {
    return undefined;
  }
}

/** The `error` of an OAuth error response: from the JSON body, else from the `WWW-Authenticate` header (RFC 6750, RFC 9449). */
export function oauthErrorOf(response: HttpResponseRecord): string | undefined {
  const fromBody = jsonOf(response)?.error;
  if (typeof fromBody === 'string') return fromBody;
  return /error="([^"]+)"/.exec(response.headers['www-authenticate'] ?? '')?.[1];
}
