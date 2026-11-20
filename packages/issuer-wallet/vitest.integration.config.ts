// The issuance client against a running EUDIPLO (needs Docker); kept out of `pnpm test`. See integration/eudiplo.integration.test.ts.
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['packages/issuer-wallet/integration/**/*.integration.test.ts'],
    testTimeout: 60_000,
    hookTimeout: 120_000,
  },
});
