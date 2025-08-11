import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/firebirdre/', // เพิ่มบรรทัดนี้เพื่อกำหนด base path สำหรับ GitHub Pages
})
