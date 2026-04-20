/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      manifest: {
        name: 'MTG Life Counter',
        short_name: 'MTG Life',
        description: 'Offline-ready Magic The Gathering Life Counter',
        theme_color: '#0b0b12',
        background_color: '#0b0b12',
        display: 'standalone',
        orientation: 'any',
        icons: [
          {
            src: '/icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
  server: { port: 5173 },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts',
    alias: {
      '@exodus/bytes/encoding-lite.js': '@exodus/bytes/encoding-lite.js',
    }
  }
});
