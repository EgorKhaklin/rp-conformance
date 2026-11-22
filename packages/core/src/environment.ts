// What the harness hands a SUT of any kind: certificates of the Test PKI and lists of the Test Trust Infrastructure.

/** A certificate with its private key, as the harness hands it to the SUT. */
export interface KeyedCertificate {
  /** PEM of the certificate. */
  certificatePem: string;
  /** Base64 DER of the certificate, as used in `x5c`. */
  certificate: string;
  /** PEM of the certificate chain without the trust anchor, leaf first. */
  chainPem: string[];
  /** Private key as JWK (EC P-256). */
  privateJwk: JsonWebKey;
  /** Private key as PKCS#8 PEM. */
  privateKeyPem: string;
}

/** A trust list as published by the Test Trust Infrastructure. */
export interface PublishedTrustList {
  /** `TL-PID`, `TL-PUB`, `TL-WP`, `TL-AC` or `TL-RC`. */
  id: string;
  /** ETSI TS 119 602 `LoTEType`. */
  loteType: string;
  /** Where the SUT fetches the list. */
  url: string;
  /** The scheme operator certificate (PEM) the SUT trusts for this list. */
  schemeOperatorCertificatePem: string;
}
