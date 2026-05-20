/**
 * Scans translations/*.js and writes translations/manifest.json.
 * Run after adding a new locale file: node scripts/sync-i18n-manifest.js
 */
const fs = require('fs');
const path = require('path');

const translationsDir = path.join(__dirname, '..', 'translations');
const localePattern = /^[a-z]{2}(-[a-z]{2})?\.js$/i;

const locales = fs
    .readdirSync(translationsDir)
    .filter((name) => localePattern.test(name))
    .map((name) => {
        const code = name.replace(/\.js$/i, '');
        const content = fs.readFileSync(path.join(translationsDir, name), 'utf8');
        const labelMatch = content.match(/label:\s*['"]([^'"]+)['"]/);
        const flagMatch = content.match(/flag:\s*['"]([^'"]+)['"]/);
        return {
            code,
            label: labelMatch ? labelMatch[1] : code.toUpperCase(),
            flag: flagMatch ? flagMatch[1] : '',
        };
    })
    .sort((a, b) => a.code.localeCompare(b.code));

const manifestPath = path.join(translationsDir, 'manifest.json');
fs.writeFileSync(manifestPath, JSON.stringify(locales, null, 2) + '\n');
console.log(`Updated ${manifestPath}:`, locales.map((l) => l.code).join(', '));
