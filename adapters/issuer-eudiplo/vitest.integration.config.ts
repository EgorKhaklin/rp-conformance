import { defineConfig } from 'vitest/config';

// The integration test needs a running EUDIPLO (see integration/issuer-eudiplo.test.ts), so it is not part of `pnpm test`.
export default defineConfig({
  test: {
    include: ['adapters/issuer-eudiplo/integration/**/*.test.ts'],
    testTimeout: 60_000,
    hookTimeout: 120_000,
  },
});
