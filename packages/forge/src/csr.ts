// PKCS#10 certification requests (RFC 2986) for the Test Registrar: parsing, the proof of possession check, and
// building one for a key, as a SUT would. `@owf/x509` has no CSR support, so the little DER needed is done here.
import { createPublicKey, verify } from 'node:crypto';
import { ecdsaP1363ToDer, publicJwkToSpki } from '@owf/x509';
import { type EcKeyPair, signEs256, toPem } from './crypto';

export class CsrError extends Error {}

/** A parsed certification request. */
export interface ParsedCsr {
  der: Uint8Array;
  /** The subject's attributes in encoding order, as dotted OID and string value. */
  subject: { oid: string; value: string }[];
  /** `subjectPKInfo`, DER. */
  subjectPublicKeyInfo: Uint8Array;
  publicJwk: JsonWebKey;
  /** The signature algorithm, dotted OID. */
  signatureAlgorithm: string;
  /** `certificationRequestInfo`, DER, the signed part. */
  info: Uint8Array;
  /** The signature, DER (ECDSA-Sig-Value). */
  signature: Uint8Array;
}

/** ECDSA signature algorithms a CSR may be signed with, and their hash. */
const ECDSA_HASHES: Record<string, string> = {
  '1.2.840.10045.4.3.2': 'sha256',
  '1.2.840.10045.4.3.3': 'sha384',
  '1.2.840.10045.4.3.4': 'sha512',
};
const ECDSA_WITH_SHA256 = '1.2.840.10045.4.3.2';

interface Tlv {
  tag: number;
  start: number;
  contentStart: number;
  end: number;
}

function readTlv(bytes: Uint8Array, offset: number): Tlv {
  if (offset + 2 > bytes.length) throw new CsrError('truncated DER');
  const tag = bytes[offset];
  let position = offset + 1;
  let length = bytes[position++];
  if (length & 0x80) {
    const octets = length & 0x7f;
    if (octets === 0 || octets > 3) throw new CsrError('unsupported DER length');
    length = 0;
    for (let i = 0; i < octets; i++) length = length * 256 + bytes[position++];
  }
  if (position + length > bytes.length) throw new CsrError('truncated DER');
  return { tag, start: offset, contentStart: position, end: position + length };
}

function childrenOf(bytes: Uint8Array, parent: Tlv): Tlv[] {
  const children: Tlv[] = [];
  for (let position = parent.contentStart; position < parent.end; ) {
    const child = readTlv(bytes, position);
    children.push(child);
    position = child.end;
  }
  return children;
}

function expectTag(tlv: Tlv | undefined, tag: number, what: string): Tlv {
  if (!tlv || tlv.tag !== tag) throw new CsrError(`not a PKCS#10 request: ${what}`);
  return tlv;
}

function decodeOid(content: Uint8Array): string {
  const arcs = [Math.floor(content[0] / 40), content[0] % 40];
  let value = 0;
  for (const byte of content.subarray(1)) {
    value = value * 128 + (byte & 0x7f);
    if (!(byte & 0x80)) {
      arcs.push(value);
      value = 0;
    }
  }
  return arcs.join('.');
}

const toDer = (csr: string | Uint8Array): Uint8Array => {
  if (typeof csr !== 'string') return csr;
  const body = csr.replace(/-----(BEGIN|END) (NEW )?CERTIFICATE REQUEST-----/g, '').replace(/\s+/g, '');
  return new Uint8Array(Buffer.from(body, 'base64'));
};

/** Parses a PKCS#10 request (PEM or DER); it does not check the signature, see `verifyCsr`. */
export function parseCsr(csr: string | Uint8Array): ParsedCsr {
  const der = toDer(csr);
  const outer = expectTag(readTlv(der, 0), 0x30, 'CertificationRequest');
  if (outer.end !== der.length) throw new CsrError('not a PKCS#10 request: trailing data');
  const [info, algorithm, signature] = childrenOf(der, outer);
  expectTag(info, 0x30, 'certificationRequestInfo');
  const [version, subject, spki, attributes] = childrenOf(der, info);
  expectTag(version, 0x02, 'version');
  if (version.end - version.contentStart !== 1 || der[version.contentStart] !== 0) throw new CsrError('not a PKCS#10 request: version is not 0');
  expectTag(subject, 0x30, 'subject');
  expectTag(spki, 0x30, 'subjectPKInfo');
  expectTag(attributes, 0xa0, 'attributes');
  const algorithmOid = expectTag(childrenOf(der, expectTag(algorithm, 0x30, 'signatureAlgorithm'))[0], 0x06, 'signatureAlgorithm');
  expectTag(signature, 0x03, 'signature');
  if (der[signature.contentStart] !== 0) throw new CsrError('not a PKCS#10 request: signature has unused bits');
  const names = childrenOf(der, subject).flatMap((set) =>
    childrenOf(der, set).map((attribute) => {
      const [type, value] = childrenOf(der, attribute);
      return {
        oid: decodeOid(der.subarray(type.contentStart, type.end)),
        value: Buffer.from(der.subarray(value.contentStart, value.end)).toString('utf8'),
      };
    }),
  );
  const subjectPublicKeyInfo = der.slice(spki.start, spki.end);
  let publicJwk: JsonWebKey;
  try {
    publicJwk = createPublicKey({ key: Buffer.from(subjectPublicKeyInfo), format: 'der', type: 'spki' }).export({ format: 'jwk' });
  } catch (error) {
    throw new CsrError(`the request's public key cannot be read: ${(error as Error).message}`);
  }
  return {
    der,
    subject: names,
    subjectPublicKeyInfo,
    publicJwk,
    signatureAlgorithm: decodeOid(der.subarray(algorithmOid.contentStart, algorithmOid.end)),
    info: der.slice(info.start, info.end),
    signature: der.slice(signature.contentStart + 1, signature.end),
  };
}

/**
 * Parses a PKCS#10 request and checks that it proves possession of its key: an EC P-256 key (the one key type of the
 * test PKI and the reference validator) and an ECDSA signature over `certificationRequestInfo` that verifies with it.
 * Throws a `CsrError` otherwise.
 */
export function verifyCsr(csr: string | Uint8Array): ParsedCsr {
  const parsed = parseCsr(csr);
  if (parsed.publicJwk.kty !== 'EC' || parsed.publicJwk.crv !== 'P-256') {
    throw new CsrError(`the request's key is not an EC P-256 key (${parsed.publicJwk.kty} ${parsed.publicJwk.crv ?? ''})`.trim());
  }
  const hash = ECDSA_HASHES[parsed.signatureAlgorithm];
  if (!hash) throw new CsrError(`the request is signed with ${parsed.signatureAlgorithm}, not ECDSA`);
  let valid = false;
  try {
    valid = verify(hash, parsed.info, { key: Buffer.from(parsed.subjectPublicKeyInfo), format: 'der', type: 'spki' }, parsed.signature);
  } catch {
    valid = false;
  }
  if (!valid) throw new CsrError('the request signature does not verify with its key (no proof of possession)');
  return parsed;
}

const derLength = (length: number) =>
  length < 0x80 ? [length] : length < 0x100 ? [0x81, length] : [0x82, length >> 8, length & 0xff];
const der = (tag: number, ...contents: Uint8Array[]) => {
  const content = Buffer.concat(contents);
  return new Uint8Array([tag, ...derLength(content.length), ...content]);
};
function encodeOid(oid: string): Uint8Array {
  const [first, second, ...rest] = oid.split('.').map(Number);
  const bytes = [40 * first + second];
  for (const arc of rest) {
    const groups = [arc & 0x7f];
    for (let value = arc >> 7; value > 0; value >>= 7) groups.unshift((value & 0x7f) | 0x80);
    bytes.push(...groups);
  }
  return der(0x06, new Uint8Array(bytes));
}
const attribute = (oid: string, tag: number, value: string) =>
  der(0x31, der(0x30, encodeOid(oid), der(tag, new TextEncoder().encode(value))));

/**
 * A PKCS#10 request (PEM) for an EC P-256 key, signed with ES256 (ecdsa-with-SHA256), with subject
 * `C=DE, O=<organization>, CN=<commonName>` and no attributes: what a SUT hands the Registrar through `enrol()`.
 */
export async function createCsr(key: Pick<EcKeyPair, 'publicJwk' | 'privateKey'>, commonName: string, organization = commonName): Promise<string> {
  const subject = der(
    0x30,
    attribute('2.5.4.6', 0x13, 'DE'),
    attribute('2.5.4.10', 0x0c, organization),
    attribute('2.5.4.3', 0x0c, commonName),
  );
  const info = der(0x30, new Uint8Array([0x02, 0x01, 0x00]), subject, publicJwkToSpki(key.publicJwk), new Uint8Array([0xa0, 0x00]));
  const signature = ecdsaP1363ToDer(await signEs256(key.privateKey, info), 32);
  const request = der(0x30, info, der(0x30, encodeOid(ECDSA_WITH_SHA256)), der(0x03, new Uint8Array([0]), signature));
  return toPem(request, 'CERTIFICATE REQUEST');
}
