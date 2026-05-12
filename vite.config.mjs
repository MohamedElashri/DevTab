import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'
import { defineConfig, loadEnv } from 'vite'
import { ViteEjsPlugin } from 'vite-plugin-ejs'
import svgrPlugin from 'vite-plugin-svgr'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const manifestPath = path.resolve(__dirname, 'public', 'manifest.json')
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'))

  return {
    base: './',
    plugins: [
      ViteEjsPlugin((viteConfig) => {
        return {
          isWebBuild: viteConfig.env.VITE_BUILD_TARGET === 'web',
        }
      }),
      react(),
      svgrPlugin(),
      stripCrossorigin(),
    ],
    define: {
      'process.env': {},
    },
    resolve: {
      tsconfigPaths: true,
      alias: {
        src: path.resolve(__dirname, './src'),
      },
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
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (id.includes('react') || id.includes('zustand') || id.includes('@tanstack') || id.includes('react-error-boundary')) {
                if (id.includes('react-contexify') || id.includes('react-select') || id.includes('react-share') || id.includes('react-simple-toasts') || id.includes('react-responsive') || id.includes('react-toggle') || id.includes('react-icons') || id.includes('react-modal') || id.includes('react-infinite-scroll-hook') || id.includes('@dnd-kit') || id.includes('@szhsin')) {
                  return 'ui'
                }
                return 'core'
              }
              if (id.includes('timeago.js')) {
                return 'utils'
              }
            }
          },
        },
      },
    },
    server: {
      open: true,
      sourcemap: false,
    },
  }
})

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
