import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test-setup.ts'],
    include: ['src/**/*.spec.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      thresholds: {
        statements: 85,
        branches: 85,
        functions: 85,
        lines: 85
      },
      exclude: [
        'node_modules/**',
        'dist/**',
        'src/main.ts',
        'src/main.server.ts',
        'src/server.ts',
        'src/app/app.config.ts',
        'src/app/app.routes.ts',
        'src/**/*.model.ts'
      ]
    }
  },
  resolve: {
    alias: {
      '@app': path.resolve(__dirname, './src/app')
    }
  }
});
