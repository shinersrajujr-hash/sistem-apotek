import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  // base sesuai nama repo GitHub Pages
  base: '/sistem-apotek/',
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      output: {
        // JS bundle → script.js
        entryFileNames: 'script.js',
        chunkFileNames: 'script.js',
        // CSS bundle → style.css
        assetFileNames: (assetInfo) => {
          if (assetInfo.name && assetInfo.name.endsWith('.css')) return 'style.css';
          return assetInfo.name ?? 'asset';
        },
      },
    },
  },
});
