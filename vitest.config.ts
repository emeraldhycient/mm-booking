import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['src/**/__tests__/**/*.test.ts'],
    environment: 'node',
    restoreMocks: true,
    coverage: {
      provider: 'v8',
      include: ['src/**/*.ts'],
      exclude: ['src/**/__tests__/**', 'src/types/**', 'src/server.ts'],
      thresholds: {
        lines: 90,
        branches: 85,
        'src/booking/to-price.ts': { lines: 100, branches: 100, functions: 100 },
        'src/booking/build-order-body.ts': { lines: 100, branches: 100, functions: 100 },
      },
    },
  },
});
