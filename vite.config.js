import { defineConfig } from "vite"

export default defineConfig({
  base: "/ThreeSolarSystemModel/", // Replace with your actual repository name
  build: {
    outDir: "dist",
    assetsDir: "assets"
  },
  server: {
    port: 3000,
    open: true
  }
})
