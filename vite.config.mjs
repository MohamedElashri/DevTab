import react from '@vitejs/plugin-react'
import path from 'path'
import { defineConfig, loadEnv } from 'vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const isWebBuild = env.VITE_BUILD_TARGET === 'web'

  return {
    base: './',
    plugins: [
      devTabHtmlPlugin(isWebBuild),
      react(),
      stripCrossorigin(),
    ],
    define: {
      'process.env': {},
    },
    resolve: {
      alias: {
        src: path.resolve(import.meta.dirname, './src'),
      },
    },
    build: {
      sourcemap: false,
      emptyOutDir: true,
      cssCodeSplit: false,
      modulePreload: false,
      rollupOptions: {
        output: {
          entryFileNames: `assets/[name]-[hash].js`,
          chunkFileNames: `assets/[name]-[hash].js`,
          assetFileNames: `assets/[name]-[hash].[ext]`,
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (id.includes('react') || id.includes('zustand') || id.includes('@tanstack')) {
                if (id.includes('react-icons') || id.includes('@dnd-kit') || id.includes('@szhsin')) {
                  return 'ui'
                }
                return 'core'
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

function devTabHtmlPlugin(isWebBuild) {
  return {
    name: 'devtab-html-transform',
    transformIndexHtml(html) {
      if (isWebBuild) {
        return html.replace(
          '<title>New Tab</title>',
          '<title>DevTab</title>\n    <link rel="manifest" href="/web_manifest.json" />'
        )
      }
      return html
    },
  }
}

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
