import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.dirname(fileURLToPath(import.meta.url));

// When the real React Three Fiber scene lands, give it its own
// manualChunks entry here so it stays split from the initial bundle and the
// ≤180KB gz budget on the main entry remains meaningful.
export default defineConfig({
  // Served from https://enzo1826.github.io/jakes9na/ (project Pages site).
  // Runtime asset URLs must go through import.meta.env.BASE_URL.
  base: '/jakes9na/',
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(rootDir, 'src'),
      '@content': path.resolve(rootDir, 'content'),
    },
  },
  build: {
    target: 'es2020',
    sourcemap: false,
    // Fonts must ship as real same-origin files, not inlined base64 data:
    // URIs in the CSS — the strict CSP (font-src 'self', no data:) would
    // otherwise block @fontsource's woff/woff2 files once Vite's default
    // 4KB asset-inlining threshold kicked in. Disabling inlining entirely
    // keeps every font request same-origin and also keeps the CSS payload
    // small.
    assetsInlineLimit: 0,
  },
});
