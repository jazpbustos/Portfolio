// Minimal dependency-free static server. Local preview only, bound to loopback.
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const base = __dirname;
const port = Number(process.env.PORT || 4173);
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.ico': 'image/x-icon', '.mp4': 'video/mp4' };
const server = http.createServer((request, response) => {
  let pathname;
  try { pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname); }
  catch { response.writeHead(400); response.end('Bad request'); return; }
  if (pathname === '/index' || pathname.endsWith('.html')) {
    const target = pathname === '/index' || pathname === '/index.html' ? '/' : pathname.slice(0, -5);
    response.writeHead(308, {Location: target + new URL(request.url, 'http://localhost').search});
    response.end(); return;
  }
  const route = pathname === '/' ? '/index.html' : (!path.extname(pathname) ? pathname + '.html' : pathname);
  const filename = path.resolve(base, `.${route}`);
  if (filename !== base && !filename.startsWith(base + path.sep)) {
    response.writeHead(403); response.end('Forbidden'); return;
  }
  // Never serve dotfiles, Git metadata, source helper configuration or arbitrary directories.
  if (pathname.split('/').some(segment => segment.startsWith('.'))) {
    response.writeHead(403); response.end('Forbidden'); return;
  }
  fs.stat(filename, (error, stat) => {
    if (error || !stat.isFile()) { response.writeHead(404); response.end('Not found'); return; }
    response.writeHead(200, { 'Content-Type': types[path.extname(filename).toLowerCase()] || 'application/octet-stream', 'Cache-Control': 'no-cache', 'X-Content-Type-Options': 'nosniff' });
    if (request.method === 'HEAD') { response.end(); return; }
    fs.createReadStream(filename).pipe(response);
  });
});
server.on('error', error => { console.error(`No se pudo iniciar la vista previa: ${error.message}`); process.exitCode = 1; });
server.listen(port, '127.0.0.1', () => console.log(`Portfolio listo en http://127.0.0.1:${port}`));
