# DevTab

**Developer news, your way.** A private, focused developer news new tab page for Firefox that keeps you close to what's shipping — with no tracking, no ads, and no external backend.

## Features

- **Curated, high-signal feed.** DevTab brings together the developer stories that matter across GitHub, Hacker News, Lobsters, Product Hunt, Reddit, and your own RSS feeds — all in one glanceable new tab.
- **Your sources, your tags.** Filter and arrange your feeds by tags and layout that fit how you work.
- **Read later, not lost.** Bookmark posts, mark articles as read, and pick up exactly where you left off.
- **A new tab you control.** Do Not Disturb hours, dark/light themes, compact mode, and more.
- **Private by design.** DevTab works locally and talks directly to each source's public API. There is no tracking, no telemetry, no ads, and no third-party backend in the middle.
- **Open source.** Apache 2.0. You can read the code, build it yourself, and trust exactly what ships.

## Data sources

- [GitHub Trending](https://github.com/trending) (via Search API)
- [Hacker News](https://news.ycombinator.com)
- [Lobsters](https://lobste.rs)
- [Product Hunt](https://www.producthunt.com/feed) (RSS)
- [Reddit](https://reddit.com)
- Custom RSS or Atom feeds

## Build

Uses `npm` and targets Node 18.

```bash
npm install
make package
```

The built extension is packaged as `firefox_extension.zip`.

## Development

```bash
make dev
```

## License

Apache 2.0 — See [LICENSE](/LICENSE).

---

## About the hard fork

DevTab began as a fork of [Hackertab.dev](https://github.com/medyo/hackertab.dev) and has since grown into its own independent project. As it diverged, the parts of the upstream that did not fit DevTab's privacy-first direction were reworked or removed:

- **No ads or telemetry**: no Amplitude, Sentry, Firebase, ad banners, or donation prompts.
- **No external news backend**: news is fetched directly from each source's public API.
- **No referral tracking**: no `ref=hackertab.dev` query parameters.
- **Focused sources**: GitHub, Hacker News, Lobsters, Product Hunt, Reddit, plus custom RSS feeds.
- **Firefox-only**: tailored for Firefox MV3.
- **No authentication**: no OAuth or user accounts.
- **Static config**: tag list bundled locally; works offline after install.

DevTab no longer tracks upstream. As a *hard fork*, it develops independently in its own direction.