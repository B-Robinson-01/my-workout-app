import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  base: '/my-workout-app/',
  
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate', // Automatically updates the app when you push new changes
      injectRegister: 'auto',     // Automatically injects the service worker into your index.html
      includeAssets: ['workout_logo.png', 'icons/apple-touch-icon.png'], // Assets to cache
      manifest: {
        name: 'My Workout App',
        short_name: 'Workout',
        description: 'Track your daily calories and protein.',
        theme_color: '#1a1a1d',      // Matches your app's dark navbar
        background_color: '#121214', // Matches your app's body background
        display: 'standalone',       // Makes it look like a native app (no browser UI)
        icons: [
          {
            src: '/workout_logo.png', // Ensure this exists in your public folder
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/workout_logo.png', 
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ]
});
