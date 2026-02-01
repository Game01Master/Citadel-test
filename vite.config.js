import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/Citadel-test/',  // <--- OBAVEZNO OVO, sa kosim crtama na početku i kraju
  build: {
    outDir: 'dist',
  }
})

