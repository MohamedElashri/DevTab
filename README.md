# Hackertab.dev — Personal Fork

This is a **personal, privacy-focused fork** of [Hackertab.dev](https://github.com/medyo/hackertab.dev). It strips out all telemetry, advertisements, and external backend dependencies for fetching news, and focuses solely on Firefox as the target browser.

## Differences from upstream

- **No ads or telemetry**: Removed all Amplitude analytics, Sentry error tracking, Firebase authentication, ad banners, and donation prompts.
- **No external news backend**: Fetches news directly from the original sources instead of proxying through a central server:
  - GitHub (via public Search API)
  - Hacker News (via Firebase API)
  - Lobsters (via public JSON endpoint)
  - Reddit (via public JSON endpoint)
- **Sources reduced to four**: Only GitHub, Hacker News, Lobsters, and Reddit are supported. All other sources (DevTo, Medium, Product Hunt, Hashnode, FreeCodeCamp, IndieHackers, Hackernoon, conferences, RSS, AI feed) have been removed.
- **No referral tracking**: Removed `ref=hackertab.dev` query parameters from all outgoing links.
- **Firefox-only**: Build scripts and manifest are tailored for Firefox. Chrome support has been removed.
- **Authentication disabled**: OAuth sign-in and user accounts are disabled.
- **Static configuration**: Remote configuration for tags is bundled locally so the extension works fully offline after installation.

## Build

This project uses `yarn` and targets Node 18.

```bash
yarn install
yarn build:firefox
```

The built extension will be packaged as `firefox_extension.zip` in the project root.

## Development

```bash
yarn start
```

Then visit the local dev server URL.

## Data sources

- [GitHub Trending](https://github.com/trending) (approximated via Search API)
- [Hacker News](https://news.ycombinator.com)
- [Lobsters](https://lobste.rs)
- [Reddit](https://reddit.com)

## License

Apache 2.0 — See [LICENSE](/LICENSE) for the full license text.
