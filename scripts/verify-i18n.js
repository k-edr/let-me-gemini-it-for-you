/**
 * Ensures translations/manifest.json matches locale *.js files on disk.
 */
const fs = require('fs');
const path = require('path');

const translationsDir = path.join(__dirname, '..', 'translations');
const localePattern = /^[a-z]{2}(-[a-z]{2})?\.js$/i;
const manifestPath = path.join(translationsDir, 'manifest.json');

const localeFiles = fs
    .readdirSync(translationsDir)
    .filter((name) => localePattern.test(name))
    .map((name) => name.replace(/\.js$/i, ''))
    .sort();

let manifest;
try {
    manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
} catch (err) {
    console.error('Failed to read translations/manifest.json:', err.message);
    process.exit(1);
}

if (!Array.isArray(manifest)) {
    console.error('manifest.json must be a JSON array of language codes.');
    process.exit(1);
}

const manifestSorted = [...manifest].sort();
const expected = JSON.stringify(localeFiles);
const actual = JSON.stringify(manifestSorted);

if (expected !== actual) {
    console.error('translations/manifest.json is out of sync.');
    console.error('  On disk:  ', localeFiles.join(', '));
    console.error('  Manifest: ', manifestSorted.join(', '));
    console.error('Run: npm run i18n:sync');
    process.exit(1);
}

for (const code of manifest) {
    const filePath = path.join(translationsDir, `${code}.js`);
    if (!fs.existsSync(filePath)) {
        console.error(`Missing locale file for "${code}": ${filePath}`);
        process.exit(1);
    }
    const content = fs.readFileSync(filePath, 'utf8');
    if (!content.includes(`LMGIFY_REGISTER_TRANSLATION('${code}'`) &&
        !content.includes(`LMGIFY_REGISTER_TRANSLATION("${code}"`)) {
        console.error(`Locale file ${code}.js does not register code "${code}".`);
        process.exit(1);
    }
}

console.log(`i18n OK: ${manifest.length} locale(s) — ${manifest.join(', ')}`);
