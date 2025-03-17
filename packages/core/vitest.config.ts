import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['./src/**/__test__/*.test.{ts,tsx}'],
    clearMocks: true,
    globals: true,
    environment: 'node',
  },
});
