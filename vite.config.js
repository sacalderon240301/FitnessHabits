import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'AntiDriftSocialClub',
        short_name: 'AntiDriftSocialClub',
        description: 'Dashboard diario de entrenamiento, agua y peso, con hábitos y grupos de gimnasio.',
        theme_color: '#12161c',
        background_color: '#12161c',
        display: 'standalone',
        start_url: '/',
        lang: 'es',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any maskable' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
        ],
      },
    }),
  ],
})
