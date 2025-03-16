import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    workspace: ['./packages/core/vitest.config.ts', './packages/react/vitest.config.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['cobertura', 'html'],
      include: ['packages/**/src'],
      exclude: ['./packages/core/src/__test__/*', './packages/examples/', './packages/**/index.{ts,tsx}'],
      extension: ['ts', 'tsx'],
    },
  },
});
