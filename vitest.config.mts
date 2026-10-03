import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['test/**/*.test.ts'],
    setupFiles: ['test/setup.ts'],
    // Each test file loads routes via vi.resetModules() + dynamic import, so
    // files are isolated already; keep the default parallelism.
  },
});
