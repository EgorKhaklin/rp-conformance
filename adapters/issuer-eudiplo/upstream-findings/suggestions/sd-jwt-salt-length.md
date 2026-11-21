# Suggestion (hardening): SD-JWT VC disclosure salts of 128 bits

**Not a conformance finding.** RFC 9901 (SD-JWT) section 9.3: "The RECOMMENDED minimum length of the randomly generated
portion of the salt is 128 bits"; what it requires (MUST) is a cryptographically random, unguessable salt chosen anew
for each claim, which EUDIPLO's salts are. ARF Annex 2 ISSU_35 is about unique elements, not salt length. The suite
records the length as informational (`PP_WS_SM_IssuerIntegrity_006` SD, spec review of 2026-11-20).

EUDIPLO 9.1.0-main.ae0792a, PID configuration in SD-JWT VC format. Every disclosure salt of the issued PID has 64 bits:
16 hexadecimal characters, unique within the credential. The mdoc `random` values (32 bytes) are not affected.

Root cause: `sdjwtvc-issuer.service.ts` passes `saltGenerator: generateSalt` from `@owf/crypto`; `@sd-jwt/core` calls it
with 16, and `generateSalt(16)` fills `length / 2` = 8 random bytes and returns them as 16 hexadecimal characters.
`@sd-jwt/core` evidently means 16 bytes.

Suggestion: at least 16 random bytes per salt, for example `base64url(randomBytes(16))`, as RFC 9901 recommends.
