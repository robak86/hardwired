import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    workspace: ['./packages/core/vitest.config.ts', './packages/react/vitest.config.ts'],
    coverage: {
      provider: 'v8',
      reporter: 'cobertura',
      include: ['./packages/**/*'],
      exclude: ['./packages/core/src/__test__/*', './*'],
    },
  },
});
