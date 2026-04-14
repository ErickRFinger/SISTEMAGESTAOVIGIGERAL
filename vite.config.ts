import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['vigi1.png'],
      manifest: {
        name: 'VIGI Envios',
        short_name: 'VIGI Envios',
        description: 'Sistema de Controle de Envio de Equipamentos para Filiais VIGI',
        theme_color: '#0f172a',
        background_color: '#0f172a',
        display: 'standalone',
        icons: [
          {
            src: 'vigi1.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'vigi1.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'vigi1.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],
})
