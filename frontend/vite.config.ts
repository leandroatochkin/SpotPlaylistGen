import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: '127.0.0.1', // <--- bind to 127.0.0.1
    port: 5173,         // optional, default is 5173
    strictPort: true    // optional, fail if port is taken
  }
});
