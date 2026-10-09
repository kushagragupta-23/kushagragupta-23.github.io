import { lstat, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const errors = [];
const required = ['index.html', 'styles.css', 'app.js', 'content.js'];
const texts = {};

for (const name of required) {
  try {
    const information = await lstat(path.join(root, name));
    if (!information.isFile() || information.isSymbolicLink()) throw new Error('must be a regular file');
    texts[name] = await readFile(path.join(root, name), 'utf8');
  } catch (error) {
    errors.push(`${name}: ${error.code === 'ENOENT' ? 'missing required file' : error.message}`);
  }
}

async function inspectReference(reference, source, htmlIds) {
  const value = reference.trim();
  if (!value) {
    errors.push(`${source}: empty link or asset reference`);
    return;
  }
  if (/^(?:javascript|vbscript):/i.test(value)) {
    errors.push(`${source}: executable link scheme is unsupported`);
    return;
  }
  if (/^(?:https?:|mailto:|tel:|data:|blob:|\/\/)/i.test(value)) {
    if (/^https?:/i.test(value)) {
      try {
        const url = new URL(value);
        if (url.username || url.password) errors.push(`${source}: URLs must not contain credentials`);
      } catch {
        errors.push(`${source}: malformed external URL`);
      }
    }
    return;
  }
  if (value.startsWith('#')) {
    try {
      if (htmlIds && (!value.slice(1) || !htmlIds.has(decodeURIComponent(value.slice(1))))) {
        errors.push(`${source}: anchor ${value} has no matching element`);
      }
    } catch {
      errors.push(`${source}: invalid anchor encoding`);
    }
    return;
  }
  let local;
  try {
    local = decodeURIComponent(value.split(/[?#]/)[0]);
    if (local === '/' || local === './') local = 'index.html';
  } catch {
    errors.push(`${source}: invalid URL encoding`);
    return;
  }
  const target = path.resolve(root, local.startsWith('/') ? local.slice(1) : path.join(path.dirname(source), local));
  if (!target.startsWith(`${path.resolve(root)}${path.sep}`)) {
    errors.push(`${source}: reference leaves the deployable project`);
    return;
  }
  const relative = path.relative(root, target).replaceAll('\\', '/');
  if (!required.includes(relative) && !['404.html', 'robots.txt', 'sitemap.xml', '.nojekyll'].includes(relative) && !relative.startsWith('assets/')) {
    errors.push(`${source}: reference ${value} will not be included in the deployment`);
    return;
  }
  try {
    const information = await lstat(target);
    if (!information.isFile() || information.isSymbolicLink()) errors.push(`${source}: reference ${value} is not a regular file`);
  } catch (error) {
    if (error.code === 'ENOENT') errors.push(`${source}: missing local file ${value}`);
    else errors.push(`${source}: cannot read ${value}`);
  }
}

const html = texts['index.html'];
if (html) {
  if (!/<!doctype\s+html>/i.test(html)) errors.push('index.html: HTML doctype is missing');
  if (!/<html\b[^>]*\blang\s*=\s*["'][^"']+["']/i.test(html)) errors.push('index.html: document language is missing');
  if (!/<meta\b[^>]*\bname\s*=\s*["']viewport["']/i.test(html)) errors.push('index.html: responsive viewport metadata is missing');
  if (!/<title>\s*[^<]+<\/title>/i.test(html)) errors.push('index.html: page title is missing');
  const ids = new Set();
  for (const match of html.matchAll(/\bid\s*=\s*["']([^"']+)["']/gi)) {
    if (ids.has(match[1])) errors.push(`index.html: duplicate element ID ${match[1]}`);
    ids.add(match[1]);
  }
  for (const match of html.matchAll(/\b(?:href|src)\s*=\s*["']([^"']*)["']/gi)) {
    await inspectReference(match[1].replaceAll('&amp;', '&'), 'index.html', ids);
  }
  for (const match of html.matchAll(/<img\b([^>]*)>/gi)) {
    if (!/\balt\s*=/i.test(match[1])) errors.push('index.html: an image has no alt attribute');
  }
}

if (texts['styles.css']) {
  for (const match of texts['styles.css'].matchAll(/url\(\s*["']?([^"')]+)["']?\s*\)/gi)) {
    await inspectReference(match[1], 'styles.css');
  }
}
for (const source of ['app.js', 'content.js']) {
  if (!texts[source]) continue;
  for (const match of texts[source].matchAll(/(?:\bfrom\s*|\bimport\s*\(\s*|\bimport\s*)["']([^"']+)["']/g)) {
    if (match[1].startsWith('.')) await inspectReference(match[1], source);
    else if (!/^https?:/i.test(match[1])) errors.push(`${source}: bare imports need a browser import map or a build step`);
  }
}

if (texts['content.js']) {
  try {
    const module = await import(`${pathToFileURL(path.join(root, 'content.js')).href}?validate=${Date.now()}`);
    if (!Object.keys(module).length) errors.push('content.js: portfolio content needs an export');
    const portfolio = module.portfolio;
    if (!portfolio || typeof portfolio !== 'object') {
      errors.push('content.js: the site needs an exported portfolio object');
    } else {
      for (const key of ['name', 'role']) {
        if (typeof portfolio[key] !== 'string' || !portfolio[key].trim()) errors.push(`content.js: ${key} is required`);
      }
      if (!Array.isArray(portfolio.bio) || !portfolio.bio.some(paragraph => typeof paragraph === 'string' && paragraph.trim())) {
        errors.push('content.js: an about biography is required');
      }
      if (!Array.isArray(portfolio.projects) || !portfolio.projects.length) {
        errors.push('content.js: at least one project is required');
      } else {
        const projectIds = new Set();
        for (const [index, project] of portfolio.projects.entries()) {
          if (!project || typeof project !== 'object') {
            errors.push(`content.js: project ${index + 1} must be an object`);
            continue;
          }
          for (const key of ['id', 'title', 'summary']) {
            if (typeof project[key] !== 'string' || !project[key].trim()) errors.push(`content.js: project ${index + 1} needs ${key}`);
          }
          if (projectIds.has(project.id)) errors.push(`content.js: duplicate project ID ${project.id}`);
          projectIds.add(project.id);
          for (const key of ['github', 'url']) {
            if (project[key] != null && (typeof project[key] !== 'string' || !/^https?:\/\//i.test(project[key]))) {
              errors.push(`content.js: ${project.title || `project ${index + 1}`} has an invalid ${key} link`);
            }
          }
        }
      }
      if (![portfolio.github, portfolio.linkedin, portfolio.email].some(value => typeof value === 'string' && value.trim())) {
        errors.push('content.js: at least one contact link is required');
      }
    }
    const seen = new Set();
    function inspectContent(value, key = 'content') {
      if (value && typeof value === 'object') {
        if (seen.has(value)) return;
        seen.add(value);
        for (const [childKey, childValue] of Object.entries(value)) inspectContent(childValue, `${key}.${childKey}`);
      } else if (typeof value === 'string') {
        if (/^(?:javascript|vbscript):/i.test(value)) errors.push(`${key}: executable URL scheme is unsupported`);
        if (/^https?:/i.test(value)) {
          try {
            const url = new URL(value);
            if (url.username || url.password) errors.push(`${key}: URLs must not contain credentials`);
            if (['example.com', 'www.example.com', 'yourusername.github.io', 'username.github.io'].includes(url.hostname)) {
              errors.push(`${key}: replace the placeholder URL before publishing`);
            }
          } catch {
            errors.push(`${key}: malformed URL`);
          }
        }
      }
    }
    inspectContent(module);
  } catch (error) {
    errors.push(`content.js: cannot load portfolio content (${error.message})`);
  }
}

if (errors.length) {
  console.error(`Portfolio validation found ${errors.length} issue${errors.length === 1 ? '' : 's'}:`);
  for (const error of errors) console.error(`- ${error}`);
  process.exitCode = 1;
} else {
  console.log('Portfolio validation passed: site files, local links, anchors, imports, and content URLs.');
}
