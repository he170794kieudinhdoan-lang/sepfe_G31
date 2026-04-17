import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 3000,
    proxy: {
      '/provinces-api': {
        target: 'https://provinces.open-api.vn/api',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/provinces-api/, ''),
        secure: true,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    target: 'es2020',
    cssCodeSplit: true,
    sourcemap: false,
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined;
          if (id.includes('react-router')) return 'router';
          if (id.includes('@tanstack/react-query')) return 'react-query';
          if (id.includes('@radix-ui') || id.includes('radix-ui')) return 'radix';
          if (id.includes('@tiptap')) return 'tiptap';
          if (id.includes('lucide-react')) return 'icons';
          if (id.includes('react-hook-form') || id.includes('@hookform') || id.includes('zod')) {
            return 'forms';
          }
          if (id.includes('date-fns')) return 'date';
          if (id.includes('html-react-parser')) return 'html-parser';
          if (id.includes('@supabase')) return 'supabase';
          if (id.includes('axios')) return 'axios';
          if (id.includes('react-easy-crop')) return 'crop';
          if (id.includes('typewriter-effect')) return 'typewriter';
          if (id.includes('react-dom') || id.includes('scheduler')) return 'react-dom';
          if (id.includes('/react/')) return 'react';
          return 'vendor';
        },
      },
    },
  },
});
