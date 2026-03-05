
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig({
    plugins: [
        react(),
        tailwindcss(),
    ],
    server: {
        port: 3000,
        proxy: {
            '/provinces-api': {
                target: 'https://provinces.open-api.vn/api',
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/provinces-api/, ''),
                secure: true,
            }
        }
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
});
