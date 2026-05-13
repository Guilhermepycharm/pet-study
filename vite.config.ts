import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(() => {
  return {
    plugins: [
      react(), 
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        manifest: {
          name: 'Pet Estudos',
          short_name: 'PetEstudos',
          description: 'Seu companheiro de foco e organização',
          theme_color: '#1a1a1a',
          background_color: '#1a1a1a',
          display: 'standalone',
          orientation: 'portrait',
        }
      })
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
  };
});
