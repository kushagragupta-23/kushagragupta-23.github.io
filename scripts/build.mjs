import { copyFile, lstat, mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const output = path.resolve(root, 'dist');
const siteUrl = 'https://kushagragupta-23.github.io';
const requiredFiles = ['index.html', 'styles.css', 'app.js', 'content.js'];
const optionalFiles = ['404.html', 'robots.txt', 'sitemap.xml'];

if (path.dirname(output) !== path.resolve(root) || path.basename(output) !== 'dist') {
  throw new Error('Build output must be the dist directory inside this project.');
}

async function exists(file) {
  try {
    return await lstat(file);
  } catch (error) {
    if (error.code === 'ENOENT') return null;
    throw error;
  }
}

async function copyAssetDirectory(source, destination) {
  await mkdir(destination, { recursive: true });
  for (const entry of await readdir(source, { withFileTypes: true })) {
    if (entry.name.startsWith('.')) continue;
    const from = path.join(source, entry.name);
    const to = path.join(destination, entry.name);
    if (entry.isSymbolicLink()) throw new Error(`Asset symlinks are unsupported: ${path.relative(root, from)}`);
    if (entry.isDirectory()) await copyAssetDirectory(from, to);
    else if (entry.isFile()) await copyFile(from, to);
    else throw new Error(`Unsupported asset: ${path.relative(root, from)}`);
  }
}

for (const file of requiredFiles) {
  const information = await exists(path.join(root, file));
  if (!information?.isFile() || information.isSymbolicLink()) {
    throw new Error(`Missing or unsupported site file: ${file}`);
  }
}

const outputInformation = await exists(output);
if (outputInformation?.isSymbolicLink()) throw new Error('Refusing to replace a dist symlink.');
if (outputInformation) await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });

for (const file of requiredFiles) await copyFile(path.join(root, file), path.join(output, file));
for (const file of optionalFiles) {
  const information = await exists(path.join(root, file));
  if (information?.isSymbolicLink()) throw new Error(`Unsupported site symlink: ${file}`);
  if (information?.isFile()) await copyFile(path.join(root, file), path.join(output, file));
}

const assetInformation = await exists(path.join(root, 'assets'));
if (assetInformation?.isSymbolicLink()) throw new Error('Assets must be a real directory.');
if (assetInformation?.isDirectory()) await copyAssetDirectory(path.join(root, 'assets'), path.join(output, 'assets'));

await writeFile(path.join(output, '.nojekyll'), '');
if (!await exists(path.join(output, 'robots.txt'))) {
  await writeFile(path.join(output, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${siteUrl}/sitemap.xml\n`);
}
if (!await exists(path.join(output, 'sitemap.xml'))) {
  await writeFile(path.join(output, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url><loc>${siteUrl}/</loc></url>\n</urlset>\n`);
}
if (!await exists(path.join(output, '404.html'))) {
  await writeFile(path.join(output, '404.html'), `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="robots" content="noindex">
  <title>Page not found — Kushagra Gupta</title>
  <style>
    :root { color-scheme: dark; }
    * { box-sizing: border-box; }
    body { margin: 0; padding: 2rem; min-height: 100svh; display: grid; place-items: center; background: #10130f; color: #f1f2e9; font: 1rem/1.6 system-ui, sans-serif; }
    main { max-width: 38rem; }
    .code { color: #b7dc79; letter-spacing: .12em; }
    h1 { font-size: clamp(2.5rem, 8vw, 4.5rem); line-height: 1.08; letter-spacing: -.04em; }
    p { color: #c5c8bd; }
    a { display: inline-block; margin-top: 1rem; padding: .8rem 1.2rem; color: #10130f; background: #b7dc79; border-radius: .5rem; text-decoration: none; font-weight: 650; }
    a:focus-visible { outline: 3px solid #fff; outline-offset: 4px; }
  </style>
</head>
<body>
  <main>
    <p class="code">404 / PAGE NOT FOUND</p>
    <h1>Let's get you back to the work.</h1>
    <p>This address doesn't lead to a page on my portfolio.</p>
    <a href="${siteUrl}/">Back to portfolio</a>
  </main>
</body>
</html>
`);
}

const index = await readFile(path.join(output, 'index.html'), 'utf8');
if (!/<html\b/i.test(index)) throw new Error('The output needs a complete HTML entry file.');
console.log(`Built static portfolio → ${path.relative(root, output)}/`);
