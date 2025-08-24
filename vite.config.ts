import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    strictPort: true, // ポートが使用中でもエラーを出して固定ポートを強制
    open: true,
    host: 'localhost' // ホストも明示的に指定
  }
})
