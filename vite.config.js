import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // กำหนด base path ให้ถูกต้องสำหรับ GitHub Pages
  base: '/firebirdre/',
  // กำหนดโฟลเดอร์ output เป็น 'dist'
  build: {
    outDir: 'dist',
    // ล้างโฟลเดอร์ dist ก่อน build ทุกครั้ง
    emptyOutDir: true,
  }
})