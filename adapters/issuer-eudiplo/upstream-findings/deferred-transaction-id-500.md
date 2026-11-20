# Deferred credential endpoint: a `transaction_id` that is not a UUID gives HTTP 500

Basis: OpenID4VCI 1.0, section 9.3. Not an EUDI-specific requirement.

## What EUDIPLO does

A deferred credential request with a valid access token and an unknown `transaction_id` that is not a UUID (16 random
bytes, base64url) is answered with HTTP 500. The log shows `QueryFailedError: invalid input syntax for type uuid`. An
unknown UUID, or a `transaction_id` already redeemed, is rejected correctly with `invalid_transaction_id`.

## What the specification says

OpenID4VCI 1.0 section 9.3: "When the Deferred Credential Request is invalid, the Credential Issuer constructs the error
response as defined in Section 8.3.1", with the error code `invalid_transaction_id`: "The Deferred Credential Request
contains an invalid transaction_id. This error occurs when the transaction_id was not issued by the respective
Credential Issuer or it was already used to obtain a Credential."

## Where in the source

The transaction's primary key is a column of type `uuid` (`@PrimaryColumn("uuid") transactionId`,
[deferred-transaction.entity.ts#L27](https://github.com/EUDIPLO/eudiplo/blob/ae0792a98991c28607879c2291d26b26b9ee9817/apps/backend/src/issuer/issuance/oid4vci/entities/deferred-transaction.entity.ts#L27)),
and `TypeormDeferredTransactionRepository.find` passes the wallet's value to `findOneBy` unchecked
([typeorm-deferred-transaction.repository.ts#L30](https://github.com/EUDIPLO/eudiplo/blob/ae0792a98991c28607879c2291d26b26b9ee9817/apps/backend/src/issuer/issuance/oid4vci/adapters/typeorm-deferred-transaction.repository.ts#L30)).
PostgreSQL refuses a non-UUID string for a `uuid` column, so the query throws before
`DeferredCredentialService.getDeferredCredential` can answer `invalid_transaction_id`. The behaviour is specific to
PostgreSQL; with SQLite the lookup would find nothing and the error would be the correct one.

Suggested change: treat a `transaction_id` that is not a UUID as unknown (validate it before the query, or catch the
query error) and answer `invalid_transaction_id`.

## How to reproduce

```bash
pnpm rp-conformance issuer run --adapter eudiplo --only PP_WS_IA_Deferred_002_UF
```

FAIL: "the Provider answered with a server error: deferred HTTP 500" (`artifacts/PP_WS_IA_Deferred_002_UF/SD+PA/`).
