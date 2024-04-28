import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['**/__test__/*.test.{ts,tsx}'],
    clearMocks: true,
    globals: true,
  },
});
