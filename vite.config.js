import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // เพิ่มบรรทัดนี้เพื่อตั้งค่า base path
  base: '/firebirdre/',
})