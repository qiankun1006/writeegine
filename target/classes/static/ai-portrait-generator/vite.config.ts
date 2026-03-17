import {defineConfig} from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
  base: process.env.NODE_ENV === 'production' ? '/static/ai-portrait-generator/dist/' : '/',
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@import "@/styles/theme.scss";`,
      },
    },
  },
  server: {
    port: 5173,
    open: false,
    // 开发模式配置：代理到 Spring Boot，实现热更新
    proxy: {
      // 所有来自 Spring Boot 的请求都代理过去
      '^(?!/src/|/@vite|/@react-refresh)': {
        target: 'http://localhost:8083',
        changeOrigin: true,
        ws: true, // 支持 WebSocket（用于 HMR）
      },
    },
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    minify: 'terser',
    sourcemap: false,
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'src/main.ts'),
        progressBarDemo: path.resolve(__dirname, 'src/demo/main.ts'),
      },
      output: {
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
  },
})

