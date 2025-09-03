import { defineConfig } from 'vite'

export default defineConfig({
  base: process.env.NODE_ENV === 'production' ? '/ThreeSolarSystemModel/' : '/',
  build: {
    outDir: "dist",
    assetsDir: "assets"
  },
  server: {
    port: 3000,
    open: true
  },
  publicDir: "public"
})
