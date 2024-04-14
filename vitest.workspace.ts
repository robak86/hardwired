import { defineWorkspace } from 'vitest/config';

export default defineWorkspace([
  './packages/core/vitest.config.ts',
  './packages/react/vitest.config.ts',
  './packages/hooks/vitest.config.ts',
  './packages/serializable/vitest.config.ts',
]);
