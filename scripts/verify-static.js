const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..', 'dist');
const pages = [];
function walk(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) walk(file);
    else if (entry.name.endsWith('.html')) pages.push(file);
  }
}
walk(root);

const missing = [];
for (const page of pages) {
  const html = fs.readFileSync(page, 'utf8');
  for (const match of html.matchAll(/(?:href|src)="(\/[^"#?]*)/g)) {
    const url = match[1];
    if (url === '/') continue;
    const target = path.join(root, url.slice(1));
    if (!fs.existsSync(target) && !fs.existsSync(`${target}.html`)) {
      missing.push(`${path.relative(root, page)} -> ${url}`);
    }
  }
}
if (missing.length) {
  console.error(missing.join('\n'));
  process.exitCode = 1;
} else {
  console.log(`${pages.length} HTML pages: local links and assets resolved`);
}
