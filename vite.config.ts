import { defineConfig } from 'vite'
import uni from '@dcloudio/vite-plugin-uni'

export default defineConfig({
  plugins: [uni()],
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler' as const,
        additionalData: `@use "@/static/css/global.scss" as *;`
      }
    }
  },
  server: {
    proxy: {
      '/api/siliconflow': {
        target: 'https://api.siliconflow.cn',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/siliconflow/, '')
      }
    }
  }
})