# Let me Gemini it for you

An homage to [Let Me Google That For You](https://lmgtfy.com/) — but with Gemini.

Static single-page app: enter a question, share a link, watch a sarcastic tutorial, then redirect to Google Search with Gemini overview (`udm=50`).

## Project structure

```
├── index.html              # English (default) + app logic
├── translations/
│   ├── manifest.json       # list of locale codes (auto-synced)
│   ├── uk.js, de.js, nl.js # one file per language
│   └── TEMPLATE.js         # copy when adding a locale
└── scripts/
    ├── sync-i18n-manifest.js
    └── verify-i18n.js
```

## Local preview

Serve the folder over HTTP (required for extra locales):

```bash
npx serve .
# open http://localhost:3000
```

## Add a language

1. Copy `translations/TEMPLATE.js` → `translations/xx.js`
2. Fill in `label`, `flag`, and `strings`
3. Run `npm run i18n:sync`
4. Commit `translations/xx.js` and `translations/manifest.json`

## CI/CD (GitHub Actions)

| Workflow | Trigger | What it does |
|----------|---------|----------------|
| [ci.yml](.github/workflows/ci.yml) | push / PR to `main` | Syncs manifest, fails if `manifest.json` is stale, verifies locale files |
| [deploy.yml](.github/workflows/deploy.yml) | push to `main` | Runs CI, deploys the repo root to **GitHub Pages** |

### Enable GitHub Pages (one-time)

1. Push this repo to GitHub
2. **Settings → Pages → Build and deployment**
3. Source: **GitHub Actions**
4. After the first successful `Deploy to GitHub Pages` run, the site is live at  
   `https://<user>.github.io/<repo>/`

After each successful deploy, `deploy.yml` removes older `github-pages` deployments and keeps only the latest. Failed deploys do not trigger cleanup.

### Scripts

```bash
npm run i18n:sync    # regenerate translations/manifest.json
npm run i18n:verify  # check manifest matches locale files
npm run ci           # sync + verify (same as CI job)
```

## License

MIT (add a LICENSE file if you publish publicly).
