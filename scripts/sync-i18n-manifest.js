/**
 * Scans translations/*.js and writes translations/manifest.json.
 * Run after adding a new locale file: node scripts/sync-i18n-manifest.js
 */
const fs = require('fs');
const path = require('path');

const translationsDir = path.join(__dirname, '..', 'translations');
const localePattern = /^[a-z]{2}(-[a-z]{2})?\.js$/i;

const codes = fs
    .readdirSync(translationsDir)
    .filter((name) => localePattern.test(name))
    .map((name) => name.replace(/\.js$/i, ''))
    .sort();

const manifestPath = path.join(translationsDir, 'manifest.json');
fs.writeFileSync(manifestPath, JSON.stringify(codes, null, 2) + '\n');
console.log(`Updated ${manifestPath}:`, codes);
