import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'
import { defineConfig, loadEnv } from 'vite'
import { ViteEjsPlugin } from 'vite-plugin-ejs'
import svgrPlugin from 'vite-plugin-svgr'
import viteTsconfigPaths from 'vite-tsconfig-paths'

// Plugin to strip crossorigin attributes from generated HTML.
// Firefox extensions can fail to load module scripts when crossorigin is present.
function stripCrossorigin() {
  return {
    name: 'strip-crossorigin',
    enforce: 'post',
    transformIndexHtml(html) {
      return html.replace(/\scrossorigin/g, '')
    },
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const buildTarget = env.VITE_BUILD_TARGET || 'web'
  const manifestPath = path.resolve(__dirname, 'public', 'manifest.json')
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'))
  const appVersion = manifest.version || '0.0.0'

  return {
    base: './',
    plugins: [
      ViteEjsPlugin((viteConfig) => {
        return {
          isWebBuild: viteConfig.env.VITE_BUILD_TARGET === 'web',
        }
      }),
      react(),
      viteTsconfigPaths(),
      svgrPlugin(),
      stripCrossorigin(),
    ],
    define: {
      'process.env': {},
    },
    build: {
      sourcemap: false,
      emptyOutDir: true,
      cssCodeSplit: false,
      rollupOptions: {
        output: {
          entryFileNames: `assets/[name]-[hash].js`,
          chunkFileNames: `assets/[name]-[hash].js`,
          assetFileNames: `assets/[name]-[hash].[ext]`,
          manualChunks: {
            core: [
              'react',
              'react-dom',
              'react-router-dom',
              'zustand',
              '@tanstack/react-query',
              '@tanstack/react-query-persist-client',
              'react-error-boundary',
            ],
            ui: [
              'react-contexify',
              'react-select',
              'react-share',
              'react-simple-toasts',
              'react-responsive',
              'react-toggle',
              'react-tooltip',
              'react-icons',
              'react-markdown',
              'react-modal',
              'react-infinite-scroll-hook',
              '@dnd-kit/core',
              '@dnd-kit/sortable',
              '@szhsin/react-menu',
            ],
            utils: [
              'axios',
              'axios-cache-adapter',
              'country-emoji',
              'htmlparser2',
              'dompurify',
              'timeago.js',
            ],
          },
        },
      },
    },
    server: {
      open: true,
      sourcemap: false,
    },
    resolve: {
      alias: {
        src: path.resolve(__dirname, './src'),
      },
    },
  }
})
