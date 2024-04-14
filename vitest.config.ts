import {defineConfig} from 'vitest/config';

export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: 'cobertura',
    },
    // reporters: ['hanging-process', 'default'],
  },
});
