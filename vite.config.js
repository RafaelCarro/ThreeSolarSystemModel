import { defineConfig } from 'vite'

export default defineConfig({
  base: '/ThreeSolarSystemModel/', // Replace with your actual repository name
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      input: {
        main: './index.html'
      }
    }
  },
  server: {
    port: 3000,
    open: true
  }
})