import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'
import { defineConfig, loadEnv } from 'vite'

const pkg = JSON.parse(fs.readFileSync(new URL('./package.json', import.meta.url), 'utf-8'))

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const isWebBuild = env.VITE_BUILD_TARGET === 'web'

  return {
    base: './',
    plugins: [
      devTabHtmlPlugin(isWebBuild),
      manifestVersionPlugin(),
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

// Injects the version from package.json into dist/manifest.json at build time,
// ensuring package.json remains the single source of truth for versioning.
function manifestVersionPlugin() {
  return {
    name: 'manifest-version-sync',
    closeBundle() {
      const manifestPath = path.resolve(import.meta.dirname, 'dist/manifest.json')
      if (fs.existsSync(manifestPath)) {
        const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'))
        const updated = {
          manifest_version: manifest.manifest_version,
          name: manifest.name,
          description: manifest.description,
          version: pkg.version,
          ...manifest,
        }
        updated.version = pkg.version
        fs.writeFileSync(manifestPath, JSON.stringify(updated, null, 2) + '\n')
      }
    },
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url === '/manifest.json') {
          const manifestPath = path.resolve(import.meta.dirname, 'public/manifest.json')
          if (fs.existsSync(manifestPath)) {
            const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'))
            const updated = {
              manifest_version: manifest.manifest_version,
              name: manifest.name,
              description: manifest.description,
              version: pkg.version,
              ...manifest,
            }
            updated.version = pkg.version
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

