# SD-JWT VC disclosure salts carry 64 bits

EUDIPLO 9.1.0-main.ae0792a, PID configuration in SD-JWT VC format.

RFC 9901 section 9.3 recommends salts of at least 128 bits of entropy; ISSU_35 (a) requires that disclosures cannot be
guessed. `sdjwtvc-issuer.service.ts` passes `saltGenerator: generateSalt` from `@owf/crypto`; `@sd-jwt/core` calls it
with 16, and `generateSalt(16)` fills `length / 2` = 8 random bytes and returns them as 16 hexadecimal characters:
64 bits per salt. The mdoc `random` values are 32 bytes and not affected.

Effect, shown by the issuer suite (cre8/rp-conformance issue 26, `PP_WS_SM_IssuerIntegrity_006` SD+PA): every salt of
the issued PID has 64 bits (`salt-entropy`: "15 of 15 salt value(s) shorter than 128 bits (e.g. bfd93fb4ac923e53,
64 bits)"). The salts are unique, so `PP_WS_SM_Unlinkability_001` passes.

Expected: at least 16 random bytes per salt, for example `base64url(randomBytes(16))`.
