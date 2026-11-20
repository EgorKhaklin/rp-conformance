// The requests the issuance client sends to the token, nonce and credential endpoints, each built by its own pure
// function from the values of the flow, so a fault can replace one member or the whole request.
import { CLIENT_ATTESTATION_HEADER, CLIENT_ATTESTATION_POP_HEADER } from '@rp-conformance/wallet-provider';
import type { HttpRequestMessage } from './http';

/** OpenID4VCI 1.0 section 4.1.1. */
export const PRE_AUTHORIZED_CODE_GRANT = 'urn:ietf:params:oauth:grant-type:pre-authorized_code';

export interface TokenRequestInput {
  tokenEndpoint: string;
  preAuthorizedCode: string;
  txCode?: string;
  /** `client_id`; the WIA's `sub`. Left out when undefined. */
  clientId?: string;
  /** The WIA (`OAuth-Client-Attestation`). */
  clientAttestation?: string;
  /** Its proof of possession (`OAuth-Client-Attestation-PoP`). */
  clientAttestationPop?: string;
  /** The DPoP proof (`DPoP`). */
  dpop?: string;
}

/** Token request of the pre-authorized code flow (OpenID4VCI 1.0 section 6.1), form-encoded. */
export function tokenRequest(input: TokenRequestInput): HttpRequestMessage {
  const form = new URLSearchParams({ grant_type: PRE_AUTHORIZED_CODE_GRANT, 'pre-authorized_code': input.preAuthorizedCode });
  if (input.txCode !== undefined) form.set('tx_code', input.txCode);
  if (input.clientId !== undefined) form.set('client_id', input.clientId);
  return {
    method: 'POST',
    url: input.tokenEndpoint,
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
      accept: 'application/json',
      ...(input.clientAttestation !== undefined ? { [CLIENT_ATTESTATION_HEADER]: input.clientAttestation } : {}),
      ...(input.clientAttestationPop !== undefined ? { [CLIENT_ATTESTATION_POP_HEADER]: input.clientAttestationPop } : {}),
      ...(input.dpop !== undefined ? { DPoP: input.dpop } : {}),
    },
    body: form.toString(),
  };
}

/** Nonce request (OpenID4VCI 1.0 section 7.1): a POST without body. */
export function nonceRequest(nonceEndpoint: string): HttpRequestMessage {
  return { method: 'POST', url: nonceEndpoint, headers: { accept: 'application/json' } };
}

export interface CredentialRequestInput {
  credentialEndpoint: string;
  accessToken: string;
  /** `token_type` of the token response; `DPoP` for a DPoP-bound token. */
  tokenType: string;
  dpop?: string;
  credentialConfigurationId: string;
  /** Key proofs of proof type `jwt`. */
  proofs: string[];
}

/** Credential request by `credential_configuration_id` with `proofs.jwt` (OpenID4VCI 1.0 section 8.2), JSON. */
export function credentialRequest(input: CredentialRequestInput): HttpRequestMessage {
  return {
    method: 'POST',
    url: input.credentialEndpoint,
    headers: {
      'content-type': 'application/json',
      accept: 'application/json',
      authorization: `${input.tokenType} ${input.accessToken}`,
      ...(input.dpop !== undefined ? { DPoP: input.dpop } : {}),
    },
    body: JSON.stringify({ credential_configuration_id: input.credentialConfigurationId, proofs: { jwt: input.proofs } }),
  };
}

/** The Credential Issuer metadata as a signed JWT (OpenID4VCI 1.0 section 12.2.2). */
export function signedMetadataRequest(metadataUrl: string): HttpRequestMessage {
  return { method: 'GET', url: metadataUrl, headers: { accept: 'application/jwt' } };
}
