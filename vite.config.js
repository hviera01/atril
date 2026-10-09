import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
  root: path.resolve(__dirname, 'src'),
  base: './',
  plugins: [react()],
  server: { port: 5199, strictPort: true },
  build: {
    outDir: path.resolve(__dirname, 'dist-web'),
    emptyOutDir: true,
    assetsInlineLimit: 0,
    rollupOptions: {
      input: {
        operador: path.resolve(__dirname, 'src/operador/index.html'),
        proyeccion: path.resolve(__dirname, 'src/proyeccion/index.html'),
      },
    },
  },
});
