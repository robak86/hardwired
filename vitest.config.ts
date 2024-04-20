import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: 'cobertura',
      exclude: [
        './packages/core/src/__test__/profile.perf.ts',
        './packages/core/src/__test__/memLeaksCheck.ts',
        './packages/core/src/__test__/excessively-deep-instantiation-check.ts',
      ],
    },
  },
});
