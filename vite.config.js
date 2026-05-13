import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
  },
  resolve: {
    alias: {
      'react-native': 'react-native-web',
      'react-native-safe-area-context': 'react-native-safe-area-context',
    },
    extensions: ['.web.js', '.web.tsx', '.js', '.jsx', '.ts', '.tsx'],
  },
  define: {
    global: 'globalThis',
    __DEV__: 'true',
    process: { env: {} },
  },
  optimizeDeps: {
    include: ['react-native-web'],
    exclude: ['react-native-vision-camera', 'react-native-safe-area-context'],
  },
  build: {
    rollupOptions: {
      external: ['react-native-vision-camera'],
    },
  },
});