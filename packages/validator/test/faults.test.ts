import {
  FAULT_IDS,
  type FaultId,
  faultInfo,
  identifierListToken,
  pid,
  pidQueryOf,
  presentation,
  RESPONSE_CHECKS,
  statusListToken,
} from '@rp-conformance/core';
import { createPublicKey, verify } from 'node:crypto';
import { base64url, type CborMap, decodeCbor, decodeEmbedded, embedded, encodeCbor, jwkThumbprint as jwkThumbprintOf, readCose, sigStructure } from '@rp-conformance/forge';
import { beforeAll, describe, expect, it } from 'vitest';
import { MDOC_IDENTIFIER_LIST_CHECKS, MDOC_STATUS_LIST_CHECKS, openid4vpSessionTranscript, SD_JWT_VC_CHECKS } from '../src/index';
import { AUDIENCE, Fixture, RESPONSE_URI } from './fixture';

// Harness design section 7, steps 1 and 2: the valid artifacts pass every check of the reference validator, and every
// fault of the catalogue fails exactly its target check and no other.

let fixture: Fixture;

beforeAll(async () => {
  fixture = await Fixture.create();
});

/**
 * A presentation with `fault`, in the credential format the fault applies to (`format` for a response fault or a
 * presentation fault of either format).
 */
const actionWith = (fault?: FaultId, format: 'dc+sd-jwt' | 'mso_mdoc' = 'dc+sd-jwt') => {
  const info = fault && faultInfo(fault);
  const credentialFormat = info?.format === 'mso_mdoc' || info?.format === 'cwt' ? 'mso_mdoc' : format;
  const only = (point: string) => (info?.point === point ? [fault as FaultId] : []);
  return presentation({
    query: pidQueryOf(credentialFormat),
    credential: pid.of(credentialFormat, { faults: only('credential') }),
    ...(info?.point === 'identifier-list'
      ? { identifierList: identifierListToken.cwt({ contains: false, faults: only('identifier-list') }) }
      : { statusList: statusListToken.of(credentialFormat === 'mso_mdoc' ? 'cwt' : 'jwt', { faults: only('status-list') }) }),
    response: { faults: [...only('response'), ...only('presentation')], ...(fault === 'presentation.replay' ? { presentationOfStep: 1 } : {}) },
  });
};

/** Another transaction, for the faults that use one. */
const otherFor = (fault: FaultId) =>
  fault === 'response.other-transaction-key' || fault === 'presentation.replay' ? fixture.transaction() : Promise.resolve(undefined);

/**
 * The reason the reference validator gives for each fault of the device binding and session binding test cases: several
 * of them fail the same check, so the reason shows that each fails it for its own defect and not, say, for a signature
 * broken by the fault layer.
 */
const BINDING_REASONS: Partial<Record<FaultId, RegExp>> = {
  'credential.no-cnf': /no cnf\.jwk/,
  'mdoc.no-device-key': /no deviceKeyInfo/,
  'presentation.kb-nonce-other': /KB-JWT nonce/,
  'presentation.kb-aud-other-client': /KB-JWT aud x509_hash:/,
  'presentation.kb-aud-no-prefix': /KB-JWT aud (?!x509_hash:)/,
  'presentation.kb-aud-client-id': /KB-JWT aud x509_hash:/,
  'presentation.kb-aud-other-origin': /KB-JWT aud origin:https:\/\/other\.example/,
  'presentation.kb-iat-past': /older than T_kb/,
  'presentation.kb-iat-future': /in the future/,
  'presentation.kb-signature-bitflip': /KB-JWT signature does not verify/,
  'presentation.kb-other-key': /KB-JWT signature does not verify/,
  'presentation.no-kb-jwt': /no KB-JWT/,
  'presentation.kb-typ-missing': /KB-JWT typ is undefined/,
  'presentation.kb-typ-jwt': /KB-JWT typ is JWT/,
  'presentation.kb-sd-hash-other': /sd_hash/,
  'presentation.kb-alg-none': /KB-JWT alg none/,
  'presentation.kb-hs256-public-key': /KB-JWT alg HS256/,
  'presentation.kb-es256k': /KB-JWT alg ES256K/,
  'presentation.replay': /KB-JWT nonce/,
  'presentation.transcript-nonce': /SessionTranscript of this request/,
  'presentation.transcript-client-id': /SessionTranscript of this request/,
  'presentation.transcript-response-uri': /SessionTranscript of this request/,
  'presentation.transcript-jwk-thumbprint': /SessionTranscript of this request/,
  'presentation.transcript-origin': /SessionTranscript of this request/,
  'presentation.device-signature-bitflip': /SessionTranscript of this request/,
  'presentation.device-signature-other-key': /SessionTranscript of this request/,
  'presentation.no-device-auth': /no deviceAuth/,
  'presentation.device-signed-element': /DeviceNameSpaces is not empty/,
  'presentation.device-signature-es256k': /alg -47/,
};

const reasonOf = (result: Awaited<ReturnType<Fixture['validate']>>, check: string) => result.credential?.checks.find((c) => c.check === check)?.detail;

const statuses = (checks: { check: string; status: string }[] | undefined) => checks?.map((c) => [c.check, c.status]);

describe('fault self-validation', () => {
  it('the valid SD-JWT VC presentation passes every check, the response checks included', async () => {
    const result = await fixture.validate(actionWith());
    expect(result.failures).toEqual([]);
    expect(statuses(result.response)).toEqual(RESPONSE_CHECKS.map((c) => [c, 'pass']));
    expect(statuses(result.credential?.checks)).toEqual(SD_JWT_VC_CHECKS.map((c) => [c, 'pass']));
  });

  it('the valid mdoc presentation with a Status List Token in CWT format passes every check', async () => {
    const result = await fixture.validate(actionWith(undefined, 'mso_mdoc'));
    expect(result.failures).toEqual([]);
    expect(statuses(result.response)).toEqual(RESPONSE_CHECKS.map((c) => [c, 'pass']));
    expect(statuses(result.credential?.checks)).toEqual(MDOC_STATUS_LIST_CHECKS.map((c) => [c, 'pass']));
  });

  it.each(['dc+sd-jwt', 'mso_mdoc'] as const)('the valid %s presentation via the DC API (dc_api.jwt, origin audience) passes every check', async (format) => {
    const result = await fixture.validate(actionWith(undefined, format), { flow: 'dc-api' });
    expect(result.failures).toEqual([]);
    expect(statuses(result.response)).toEqual(RESPONSE_CHECKS.map((c) => [c, 'pass']));
    expect(statuses(result.credential?.checks)).toEqual((format === 'mso_mdoc' ? MDOC_STATUS_LIST_CHECKS : SD_JWT_VC_CHECKS).map((c) => [c, 'pass']));
  });

  it('the valid mdoc presentation with an identifier list passes every check', async () => {
    const action = presentation({
      query: 'default_query_pid_mdoc',
      credential: pid.mdoc(),
      identifierList: identifierListToken.cwt({ contains: false }),
    });
    const result = await fixture.validate(action);
    expect(result.failures).toEqual([]);
    expect(statuses(result.credential?.checks)).toEqual(MDOC_IDENTIFIER_LIST_CHECKS.map((c) => [c, 'pass']));
  });

  it('an mdoc whose identifier is on its identifier list fails exactly identifier-status', async () => {
    const action = presentation({
      query: 'default_query_pid_mdoc',
      credential: pid.mdoc(),
      identifierList: identifierListToken.cwt({ contains: true }),
    });
    expect((await fixture.validate(action)).failures).toEqual(['identifier-status']);
  });

  it.each(FAULT_IDS.filter((fault) => ['response', 'presentation'].includes(faultInfo(fault).point) && !faultInfo(fault).flow))(
    '%s fails exactly its target check via the DC API too',
    async (fault) => {
      const result = await fixture.validate(actionWith(fault), { other: await otherFor(fault), flow: 'dc-api' });
      const target = faultInfo(fault).target;
      expect(result.failures).toEqual(target ? [target] : []);
      if (BINDING_REASONS[fault] && target) expect(reasonOf(result, target)).toMatch(BINDING_REASONS[fault]);
    },
  );

  it.each(FAULT_IDS)('%s fails exactly its target check', async (fault) => {
    const result = await fixture.validate(actionWith(fault), { other: await otherFor(fault) });
    const target = faultInfo(fault).target;
    expect(result.failures).toEqual(target ? [target] : []);
    if (BINDING_REASONS[fault] && target) expect(reasonOf(result, target)).toMatch(BINDING_REASONS[fault]);
  });

  it('every fault that fails key-binding or kb-freshness has its own expected reason', () => {
    const binding = FAULT_IDS.filter((fault) => ['key-binding', 'kb-freshness'].includes(faultInfo(fault).target ?? ''));
    expect(binding.filter((fault) => !BINDING_REASONS[fault])).toEqual([]);
  });

  // The ES256K faults are genuine device authentication with another algorithm: the credential is bound to the
  // secp256k1 key, and the signature verifies with it.
  const verifiesWithSecp256k1 = (jwk: JsonWebKey, data: Uint8Array | string, signature: Uint8Array) =>
    verify('sha256', typeof data === 'string' ? Buffer.from(data) : data, { key: createPublicKey({ key: jwk as never, format: 'jwk' }), dsaEncoding: 'ieee-p1363' }, signature);

  it('presentation.kb-es256k is an ES256K KB-JWT by the secp256k1 key in cnf.jwk', async () => {
    const result = await fixture.validate(actionWith('presentation.kb-es256k'));
    const parts = result.presentation.split('~');
    const cnf = base64url.decodeJson<{ cnf: { jwk: JsonWebKey } }>(parts[0].split('.')[1]).cnf.jwk;
    expect(cnf).toEqual(fixture.secp256k1.publicJwk);
    const [h, p, sig] = (parts.at(-1) ?? '').split('.');
    expect(base64url.decodeJson(h).alg).toBe('ES256K');
    expect(verifiesWithSecp256k1(cnf, `${h}.${p}`, base64url.decode(sig))).toBe(true);
  });

  it('presentation.device-signature-es256k is an ES256K device signature by the secp256k1 device key of the MSO', async () => {
    const result = await fixture.validate(actionWith('presentation.device-signature-es256k'));
    const document = (decodeCbor<CborMap>(base64url.decode(result.presentation)).get('documents') as CborMap[])[0];
    const issuerAuth = readCose((document.get('issuerSigned') as CborMap).get('issuerAuth'));
    const deviceKey = ((decodeEmbedded<CborMap>(decodeCbor(issuerAuth.payload as Uint8Array)).get('deviceKeyInfo') as CborMap).get('deviceKey')) as CborMap;
    expect(deviceKey.get(-1)).toBe(8);
    const jwk = { kty: 'EC', crv: 'secp256k1', x: base64url.encode(deviceKey.get(-2) as Uint8Array), y: base64url.encode(deviceKey.get(-3) as Uint8Array) };
    expect(jwk).toEqual(fixture.secp256k1.publicJwk);
    const deviceSigned = document.get('deviceSigned') as CborMap;
    const signature = readCose((deviceSigned.get('deviceAuth') as CborMap).get('deviceSignature'));
    const transcript = openid4vpSessionTranscript({
      handover: { flow: 'redirect', clientId: AUDIENCE, responseUri: RESPONSE_URI },
      nonce: result.transaction.nonce,
      jwkThumbprint: await jwkThumbprintOf(result.transaction.key.publicJwk as JsonWebKey),
    });
    const deviceAuthentication = encodeCbor(embedded(['DeviceAuthentication', transcript, document.get('docType'), deviceSigned.get('nameSpaces')]));
    expect(verifiesWithSecp256k1(jwk, sigStructure(signature.protectedBytes, deviceAuthentication), signature.signature)).toBe(true);
  });

  it.each(['redirect', 'dc-api'] as const)('an mdoc presentation replayed from another transaction fails exactly key-binding (%s)', async (flow) => {
    const result = await fixture.validate(actionWith('presentation.replay', 'mso_mdoc'), { other: await fixture.transaction(), flow });
    expect(result.failures).toEqual(['key-binding']);
    expect(reasonOf(result, 'key-binding')).toMatch(/SessionTranscript of this request/);
  });

  it('in first-failure mode an invalid credential stops before its status list is fetched', async () => {
    for (const fault of ['credential.exp-past', 'credential.signature-bitflip', 'mdoc.valid-until-past', 'mdoc.signature-bitflip'] as const) {
      const result = await fixture.validate(actionWith(fault), { mode: 'first-failure' });
      expect(result.credential?.failed).toBe(faultInfo(fault).target);
      expect(result.credential && 'statusListFetched' in result.credential && result.credential.statusListFetched).toBe(false);
    }
  });
});
