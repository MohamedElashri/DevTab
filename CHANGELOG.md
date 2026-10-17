# Changelog

All notable changes to DevTab are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.3.0] - 2026-10-17

### Changed
- **Zero Third-Party Runtime Dependencies**: DevTab now runs exclusively on React 19 core (`react` and `react-dom`), eliminating all 20 external runtime libraries.
- **Native Data Query & Caching**: Replaced `@tanstack/react-query` and its persisters with an internal `QueryClient` and `useQuery` hook powered by React 19 `useSyncExternalStore`, featuring stale-while-revalidate, request deduplication, and offline `localStorage` caching.
- **Native Routing**: Replaced `react-router-dom` with a lightweight native hash router.
- **Native State Management**: Replaced `zustand` with an internal reactive store using `useSyncExternalStore` with automatic `localStorage` persistence.
- **Native Icons**: Replaced `react-icons` with inlined, zero-overhead SVG icon components.
- **Native Drag-and-Drop**: Replaced `@dnd-kit` with native HTML5 drag-and-drop and accessible keyboard reordering (`ArrowLeft` / `ArrowRight`).
- **Native UI Components**: Replaced `react-select`, `react-modal`, and `@szhsin/react-menu` with tailored, accessible native React components.
- **Native Utilities**: Replaced `timeago.js`, `react-responsive`, `react-error-boundary`, `react-spinners`, `clsx`, `react-simple-toasts`, and `react-share` with internal utilities and hooks.
- **Single Source of Truth Versioning**: Consolidated version number strictly to `package.json`, automatically injecting it into `dist/manifest.json` and client runtime via Vite at build time.
- **Component Consolidation**: Unified duplicate article row items into a shared `ArticleCardItem` component across Hacker News, Lobsters, Reddit, and RSS cards; consolidated list and placeholder components into `ListComponent.tsx`.
- **Dead Code & Asset Removal**: Removed obsolete storage wrappers, unused string utilities, empty feed directories, and orphaned icons (`icon_hackernoon.jpeg`, `icon_hashnode.png`).
- ** Reddit fallback**: Add reddit fallback to `.rss` when `.json` not working and show error instead of No items

---

## [1.2.2] - 2026-08-18

### Added
- Make targets for automated version bumping and release packaging.
- Product Hunt card integration via RSS feed.

[1.3.0]: https://github.com/MohamedElashri/DevTab/compare/v1.2.2...v1.3.0
[1.2.2]: https://github.com/MohamedElashri/DevTab/releases/tag/v1.2.2
