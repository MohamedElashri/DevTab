import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'
import { defineConfig, loadEnv } from 'vite'

const pkg = JSON.parse(fs.readFileSync(new URL('./package.json', import.meta.url), 'utf-8'))

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const isWebBuild = env.VITE_BUILD_TARGET === 'web'
  const browser = env.VITE_BROWSER || 'firefox'
  if (!['firefox', 'chrome'].includes(browser)) {
    throw new Error(`Unsupported extension browser: ${browser}`)
  }

  return {
    base: './',
    plugins: [
      devTabHtmlPlugin(isWebBuild),
      manifestVersionPlugin(browser),
      react(),
      stripCrossorigin(),
    ],
    define: {
      'process.env': {},
      __APP_VERSION__: JSON.stringify(pkg.version),
    },
    resolve: {
      alias: {
        src: path.resolve(import.meta.dirname, './src'),
      },
    },
    build: {
      outDir: isWebBuild ? 'dist/web' : `dist/${browser}`,
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
              return 'core'
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

// Keep the source manifest shared; generate browser-specific fields at build time.
function manifestVersionPlugin(browser) {
  function transformManifest(manifest) {
    const updated = { ...manifest, version: pkg.version }
    if (browser === 'chrome') {
      delete updated.browser_specific_settings
      updated.background = { service_worker: 'background.js' }
    }
    return updated
  }

  let outDir
  return {
    name: 'manifest-version-sync',
    configResolved(config) {
      outDir = path.resolve(config.root, config.build.outDir)
    },
    closeBundle() {
      const manifestPath = path.join(outDir, 'manifest.json')
      if (fs.existsSync(manifestPath)) {
        const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'))
        const updated = transformManifest(manifest)
        fs.writeFileSync(manifestPath, JSON.stringify(updated, null, 2) + '\n')
      }
    },
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url === '/manifest.json') {
          const manifestPath = path.resolve(import.meta.dirname, 'public/manifest.json')
          if (fs.existsSync(manifestPath)) {
            const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'))
            const updated = transformManifest(manifest)
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify(updated, null, 2) + '\n')
            return
          }
        }
        next()
      })
    },
  }
}

