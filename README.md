# Let me Gemini it for you

An homage to [Let Me Google That For You](https://lmgtfy.com/) — but with Gemini.

Try it here: [Let Me Gemini It For You](https://k-edr.github.io/let-me-gemini-it-for-you/)

Static single-page app: enter a question, share a link, watch a sarcastic tutorial, then redirect to Google Search with Gemini overview (`udm=50`).

## Project structure

```
├── index.html              # markup only
├── assets/
│   ├── main.css            # Tailwind build (npm run build:css)
│   ├── styles.css          # custom theme & animations
│   ├── icons.js            # inline SVG icons
│   └── app.js              # app logic & i18n
├── translations/
│   ├── manifest.json       # locale metadata (auto-synced)
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

### Scripts

```bash
npm run build:css    # compile Tailwind → assets/main.css
npm run i18n:sync    # regenerate translations/manifest.json
npm run i18n:verify  # check manifest matches locale files
npm run ci           # build + sync + verify (same as CI job)
```

## License

MIT (add a LICENSE file if you publish publicly).
