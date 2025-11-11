import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const plugins = [
    react({
      include: ['**/*.jsx', '**/*.js', '**/*.tsx', '**/*.ts'],
    }),
  ];

  if (process.env.ANALYZE === 'true') {
    plugins.push(
      visualizer({
        filename: 'dist/stats.html',
        open: true,
        gzipSize: true,
        brotliSize: true,
      }),
    );
  }

  env.NODE_ENV = env.NODE_ENV || mode;

  if (!env.PUBLIC_URL) {
    env.PUBLIC_URL = '';
  }

  return {
    base: './',
    plugins,
    define: {
      'process.env': env,
    },
    resolve: {
      extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
      alias: {
        'react-virtualized': 'react-virtualized/dist/commonjs/index.js',
      },
    },
    esbuild: {
      jsx: 'automatic',
      jsxDev: mode !== 'production',
    },
    optimizeDeps: {
      esbuildOptions: {
        loader: {
          '.js': 'jsx',
        },
      },
      include: ['react-virtualized'],
    },
    server: {
      port: 3000,
      open: false,
    },
    preview: {
      port: 3000,
      open: false,
    },
  };
});
