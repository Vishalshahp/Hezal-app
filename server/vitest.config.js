import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    testTimeout: 15000,
    fileParallelism: false // Run test suites sequentially to avoid MongoDB collection collisions
  }
});
