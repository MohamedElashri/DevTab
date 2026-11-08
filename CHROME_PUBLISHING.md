# First Chrome Web Store submission

DevTab is uploaded manually. Work through these steps in order; building or pushing
to GitHub does not upload or publish the extension.

## 1. Build and load Chrome locally

```bash
make install
make test
make package-chrome
```

This creates `dist/chrome/` for local testing and `chrome_extension.zip` for upload.
The shared version comes from `package.json`. Version `1.3.1` includes the revised
description for resubmission after the initial Chrome rejection. Each replacement
package must have a version greater than the previous Chrome upload, including a
rejected upload. Versions can be shared between the Firefox and Chrome stores.

1. Open `chrome://extensions` in Chrome.
2. Enable **Developer mode** at the top right.
3. Click **Load unpacked**.
4. Select the project's `dist/chrome/` directory, not the ZIP or the project root.
5. Open a new tab. Accept Chrome's new-tab change prompt if it appears.

Verify before proceeding:

- The onboarding and new tab page open without extension errors.
- GitHub, Hacker News, Lobsters, Reddit, and Product Hunt load. Distinguish remote
  service errors or rate limits from extension errors.
- Add a custom RSS/Atom URL, allow access to that site, and check it loads.
- Deny a different feed's permission request and confirm the message is clear.
- Change theme/layout, bookmark a post, and reload; the choices should persist.
- Close and reopen Chrome and check DevTab still works with saved choices.
- With service worker DevTools closed, let the worker become inactive, then reopen
  the new tab page and check that feed requests wake it successfully.

Use the extension card's **Errors** button if present, and its **service worker**
inspection link for background errors. After a rebuild, click **Reload** on the
extension card and reopen the new tab page.

Google's [local loading guide](https://developer.chrome.com/docs/extensions/get-started/tutorial/hello-world)
and [package preparation guide](https://developer.chrome.com/docs/webstore/prepare).

## 2. Register the publisher account

1. Sign in to the [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
   with the Google account that should own DevTab.
2. Accept the developer agreement and pay the one-time registration fee ($5).
3. Enable 2-Step Verification for that Google account.
4. Set the publisher name and verify the contact email.
5. Complete the trader/non-trader declaration accurately and any verification
   requested for your account. Trader status depends on how you operate, not just
   whether the extension is free.

See [registration](https://developer.chrome.com/docs/webstore/register),
[registration fee](https://developer.chrome.com/blog/cws-role-expansion-developer-dashboard),
[account setup](https://developer.chrome.com/docs/webstore/set-up-account),
[2-Step Verification requirement](https://developer.chrome.com/docs/webstore/program-policies/policies),
and [trader declarations](https://developer.chrome.com/docs/webstore/program-policies/trader-verification-faq).

## 3. Prepare listing assets and privacy policy

Have these ready before completing the listing:

- Name: **DevTab**. The short description and version come from the uploaded manifest.
- Detailed description explaining the developer news dashboard, custom feeds,
  local bookmarks, and customization. Make clear that it replaces New Tab. Use
  the suggested description below without adding lists of brands or keywords.
- Appropriate category and English as the listing language.
- Icon: `public/logos/logo128.png` (128×128 PNG).
- At least one screenshot showing DevTab in Chrome, at 1280×800 or 640×400.
  The existing `assests/devtab.png` is 1800×906 and needs replacing with an image
  at the store's supported dimensions. Promotional images are optional.
- Support URL: `https://github.com/MohamedElashri/DevTab/issues`.
- A publicly accessible privacy-policy URL. Publish and review the policy before
  submitting; the repository currently has no standalone privacy policy.

The policy should accurately explain that preferences, bookmarks, read state,
feed URLs, and caches are stored locally; that DevTab has no developer-operated
backend or analytics; and that loading feeds/images sends requests to the relevant
third-party providers, which receive normal request information such as the IP
address and requested URL. Searching or opening a link contacts the chosen site.
Avoid saying that no data ever leaves the device. Explain optional RSS site access
and how users can remove local data, and provide a contact method.

See [image requirements](https://developer.chrome.com/docs/webstore/images) and
[privacy disclosures](https://developer.chrome.com/docs/webstore/cws-dashboard-privacy).

### Suggested store description

> DevTab turns your browser's new tab into a personal developer news dashboard.
> Read stories and discover projects from the feeds you choose, or add your own
> RSS and Atom subscriptions.
>
> Filter stories by topic, save bookmarks, and keep track of what you have read.
> Adjust the theme, layout, and card settings to fit your reading habits, and use
> Do Not Disturb hours when you want a quieter new tab.
>
> Preferences, bookmarks, and reading state are saved locally in your browser.
> Feed content is fetched directly from its providers. DevTab has no advertising,
> analytics, or developer-operated backend.

### Resubmitting after Yellow Argon

The first submission was rejected for excessive keywords in the description,
specifically the list of source brands. The shared manifest now uses this short
description:

> A customizable developer news dashboard for your new tab, with personal feeds,
> bookmarks, and reading preferences.

Build a fresh `chrome_extension.zip` and upload it to the **existing** item's
Package tab with the increased version. Replace the dashboard's detailed English
description with the suggested prose above as well; uploading a ZIP does not
rewrite the detailed listing text. Check any other language listings for the
same source-name list before resubmitting. Source names remain in permission
justifications because those fields explain access to specific domains.

See Google's [listing requirements](https://developer.chrome.com/docs/webstore/program-policies/listing-requirements).

## 4. Upload the package and complete the forms

1. In the Developer Dashboard, choose **Add new item**.
2. Upload `chrome_extension.zip`, not `firefox_extension.zip` or `source_code.zip`.
3. Fill out **Store listing** with the assets and text from step 3.
4. Complete **Privacy practices**. Suggested single purpose:

   > Replace the new tab page with a customizable developer news dashboard that
   > displays selected news sources and user-added RSS feeds.

5. Justify the host permissions using the table below.
6. Declare no remotely hosted executable code: the extension bundles its JavaScript
   locally; feeds and images are data. Review this again if the implementation changes.
7. Complete the data-use disclosures and certifications based on the actual
   behavior and the published policy. Local storage alone does not imply developer
   collection; review third-party requests as well. Do not automatically select
   every data category merely because it is stored locally.
8. Add the privacy-policy URL.
9. Under **Distribution**, choose the desired countries and visibility. Use
   **Public** for a searchable listing, or **Unlisted** to distribute by direct link.

| Host permission | Justification |
| --- | --- |
| `https://api.github.com/*` | Fetch public repositories for the GitHub news card. |
| `https://hacker-news.firebaseio.com/*` | Fetch public stories and item details for the Hacker News card. |
| `https://lobste.rs/*` | Fetch public stories for the Lobsters card. |
| `https://www.producthunt.com/*` | Fetch the public Product Hunt RSS feed. |
| `https://www.reddit.com/*` | Fetch public subreddit posts using JSON or RSS. |
| Optional `<all_urls>` | Allow user-chosen HTTP/HTTPS RSS or Atom sites. DevTab requests access to the specific origin when the user adds a feed, rather than requesting all sites at installation. |

There are no content scripts, browsing-history permissions, or remote executable
scripts. No `storage` permission is requested; persistence uses localStorage.

Optional reviewer notes:

> No account or login is required. Open a new tab after installation. Enable the
> desired source cards in Settings. To test custom feeds, add an RSS or Atom URL
> and accept the site permission prompt. News requests go directly to the source
> providers; no developer-operated backend is used. Source providers may rate-limit
> requests or temporarily reject them.

See [publishing](https://developer.chrome.com/docs/webstore/publish) and
[privacy form guidance](https://developer.chrome.com/docs/webstore/cws-dashboard-privacy).

## 5. Submit for review and publish

Resolve any dashboard errors, review the listing and disclosures, and click
**Submit for review**. Choose automatic publishing after approval, or deferred
publishing if you want to publish manually after approval. Approval timing varies;
check dashboard status and account email for reviewer questions.

After publication, install DevTab from its store listing in a separate Chrome
profile and repeat the basic checks. Add the Chrome listing URL to README.md.

## Later releases: Firefox and Chrome together

```bash
VERSION=1.3.2 make release
```

Choose a version above the version already uploaded to either store. Test both
`dist/firefox/` and `dist/chrome/`. Upload `firefox_extension.zip` to the existing
Firefox listing (and `source_code.zip` if requested for source review). Upload
`chrome_extension.zip` to the existing Chrome listing. Do not create a new listing
for each update. No store credentials or automatic publishing are configured.
