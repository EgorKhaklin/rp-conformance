# mdoc: dates are issued as text strings, not as `full-date` (tag 1004)

Basis: **EUDI profile only**, the PID Rulebook v1.7 (17 July 2026) section 3.1.2 and ARF Annex 2 PID_09 ("SHALL encode
each attribute or metadata in the PID as specified in the third column of the tables"; PID_09 still links the table as
"Section 4.2.1 of the PID Rulebook", which v1.7 numbers 3.1.2). The `full-date` type itself is RFC 8943. Whether
ISO/IEC 18013-5 requires it for its own date elements was not verified (the standard was not available to the review).

Not reported upstream yet; this is the issue text prepared for it. Found by `PP_WS_DM_PidMdoc_002` [MD+PA] of the issuer
suite against `ghcr.io/eudiplo/eudiplo@sha256:1a1f53b77b69cfeaf573f6950de6a70947b909181654a6de252f8207e1b138a7`
(`9.1.0-main.ae0792a`).

## What happens

EUDIPLO issues every date element of an mdoc as a CBOR text string. For the PID (`eu.europa.ec.eudi.pid.1`) the PID
Rulebook v1.7 section 3.1.2 gives `birth_date` the encoding `full-date` ("`full-date = #6.1004(tstr)`", CBOR tag 1004,
RFC 8943), and `expiry_date` and `issuance_date` "`tdate` or `full-date`" (tag 0 or 1004).

The issued `IssuerSigned` of the `mso_mdoc` PID configuration, element by element, decoded (claims from the offer,
`credentialClaims` `inline`):

```text
eu.europa.ec.eudi.pid.1 family_name       text "Mustermann"
eu.europa.ec.eudi.pid.1 given_name        text "Erika"
eu.europa.ec.eudi.pid.1 birth_date        text "1964-08-12"     <- expected tag 1004
eu.europa.ec.eudi.pid.1 place_of_birth    map {"locality":"Berlin","country":"DE"}
eu.europa.ec.eudi.pid.1 nationality       array ["DE"]
eu.europa.ec.eudi.pid.1 issuing_authority text "DE"
eu.europa.ec.eudi.pid.1 issuing_country   text "DE"
eu.europa.ec.eudi.pid.1 issuance_date     text "2026-11-20"     <- expected tag 0 or 1004
eu.europa.ec.eudi.pid.1 expiry_date       text "2026-12-20"     <- expected tag 0 or 1004
eu.europa.ec.eudi.pid.1 age_over_18       bool true
eu.europa.ec.eudi.pid.1 age_in_years      uint 62
eu.europa.ec.eudi.pid.1 age_birth_year    uint 1964
```

## Why

`MdocIssuerService.addClaimsToIssuer` (`apps/backend/src/issuer/configuration/credentials/issuer/mdoc-issuer/`) hands
the claims to `@owf/mdoc`'s `Issuer.addIssuerNamespace` as plain JSON values. A claim field's `type`
(`ClaimFieldDefinitionSchema`, `dto/claim-field-definition.dto.ts`) is one of `string`, `number`, `integer`, `boolean`,
`object`, `array`: there is no date type, and nothing converts a date string to `DateOnly` (tag 1004) or `Date`
(tag 0). The demo configuration `assets/config/demo/issuance/credentials/pid-mdoc.json` declares `birth_date`,
`issuance_date` and `expiry_date` as `string` with a `YYYY-MM-DD` pattern, so the demo PID has the same defect.

## Suggested fix

A field type (or a `format`) for `full-date` and `tdate` in the mdoc claim definitions, mapped to `DateOnly` and `Date`
before `addIssuerNamespace`, with the PID Rulebook's date elements declared so in the demo configuration.

## Reproduce

```bash
EUDIPLO_IMAGE=ghcr.io/eudiplo/eudiplo@sha256:1a1f53b77b69cfeaf573f6950de6a70947b909181654a6de252f8207e1b138a7 EUDIPLO_PORT=3221 docker compose -p rp-conformance-i21 -f adapters/eudiplo/docker-compose.yml up -d --wait
```

```bash
EUDIPLO_PORT=3221 pnpm rp-conformance issuer run --adapter eudiplo --ics adapters/issuer-eudiplo/ics.yaml --only PP_WS_DM_PidMdoc_002
```

The step fails `pid-attributes` with `birth_date is a text string "1964-08-12", not a full-date (tag 1004)`; the issued
credential is in `artifacts/PP_WS_DM_PidMdoc_002/MD+PA/step-1/credential-1.txt` of the report.
