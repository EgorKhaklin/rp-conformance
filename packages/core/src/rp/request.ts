// The request of a Relying Party as the Conformance Wallet captures it (catalogue scenario SCN-Q), for the request-side
// checks of the reference validator: raw, so the validator decodes and checks every part itself.
import type { Flow } from './definition';

export interface CapturedRequest {
  flow: Flow;
  /** Redirects: the invocation URI the Relying Party handed out. */
  invocationUri?: string;
  /** Redirects: the answer at `request_uri`. */
  requestUri?: { status?: number; contentType?: string | null; body?: string };
  /** DC API: the protocol of the request the Conformance Wallet took, and that request's `data`. */
  protocol?: string;
  data?: unknown;
  /** DC API: the Origin of the Relying Party's page. */
  origin?: string;
  /** Redirects: the answer to a second GET of `request_uri` (ProtocolFlow_002). */
  refetch?: { status?: number; contentType?: string | null; body?: string };
  /** Redirects: the `wallet_nonce` the Conformance Wallet posted to `request_uri` (ProtocolFlow_003); `requestUri` is the answer. */
  walletNonce?: string;
}
