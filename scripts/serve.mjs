import { createServer } from 'node:http';
import { lstat, readFile, realpath } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const project = fileURLToPath(new URL('../', import.meta.url));
const root = path.resolve(project, process.argv.includes('--dist') ? 'dist' : '.');
const port = Number(process.env.PORT || 4173);
if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('PORT must be between 1 and 65535.');
const allowedRootFiles = new Set(['index.html', 'styles.css', 'app.js', 'content.js', '404.html', 'robots.txt', 'sitemap.xml', '.nojekyll']);
function isDeployable(relative) {
  return allowedRootFiles.has(relative) || (relative.startsWith('assets/') && relative.split('/').every(part => !part.startsWith('.')));
}
const types = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8', '.svg': 'image/svg+xml',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.webp': 'image/webp', '.avif': 'image/avif', '.gif': 'image/gif',
  '.ico': 'image/x-icon', '.woff': 'font/woff', '.woff2': 'font/woff2',
  '.ttf': 'font/ttf', '.pdf': 'application/pdf', '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8', '.mp4': 'video/mp4', '.webm': 'video/webm',
};

let canonicalRoot;
try {
  canonicalRoot = await realpath(root);
} catch (error) {
  if (error.code === 'ENOENT') throw new Error('Preview output is missing. Run npm run build first.');
  throw error;
}

async function sendNotFound(request, response) {
  let content = 'Page not found';
  let type = 'text/plain; charset=utf-8';
  try {
    content = await readFile(path.join(root, '404.html'));
    type = types['.html'];
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
  response.writeHead(404, { 'Content-Type': type });
  response.end(request.method === 'HEAD' ? undefined : content);
}

const server = createServer(async (request, response) => {
  response.setHeader('Cache-Control', 'no-store');
  response.setHeader('X-Content-Type-Options', 'nosniff');
  if (!['GET', 'HEAD'].includes(request.method)) {
    response.writeHead(405, { Allow: 'GET, HEAD' });
    response.end('Method not allowed');
    return;
  }
  try {
    let pathname = decodeURIComponent(new URL(request.url, 'http://127.0.0.1').pathname);
    if (pathname.includes('\\') || pathname.includes('\0')) {
      response.writeHead(400);
      response.end('Invalid path');
      return;
    }
    if (pathname === '/') pathname = '/index.html';
    const location = path.resolve(root, pathname.replace(/^\/+/, ''));
    const relative = path.relative(root, location).replaceAll('\\', '/');
    if (!location.startsWith(`${root}${path.sep}`) || !isDeployable(relative)) {
      await sendNotFound(request, response);
      return;
    }
    const information = await lstat(location);
    const canonicalLocation = await realpath(location);
    const canonicalRelative = path.relative(canonicalRoot, canonicalLocation).replaceAll('\\', '/');
    if (!information.isFile() || information.isSymbolicLink() || !canonicalLocation.startsWith(`${canonicalRoot}${path.sep}`) || !isDeployable(canonicalRelative)) {
      await sendNotFound(request, response);
      return;
    }
    const content = await readFile(location);
    response.writeHead(200, {
      'Content-Type': types[path.extname(location).toLowerCase()] || 'application/octet-stream',
      'Content-Length': content.length,
    });
    response.end(request.method === 'HEAD' ? undefined : content);
  } catch (error) {
    if (['ENOENT', 'ENOTDIR'].includes(error.code)) {
      await sendNotFound(request, response);
    } else if (error instanceof URIError || error instanceof TypeError) {
      response.writeHead(400);
      response.end('Invalid request');
    } else {
      console.error('Static request failed:', error.message);
      response.writeHead(500);
      response.end('Server error');
    }
  }
});

server.on('error', (error) => {
  console.error(error.code === 'EADDRINUSE' ? `Port ${port} is in use. Set PORT to another port.` : error.message);
  process.exitCode = 1;
});
server.listen(port, '127.0.0.1', () => console.log(`Portfolio ${process.argv.includes('--dist') ? 'preview' : 'dev server'}: http://127.0.0.1:${port}`));
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => server.close());
