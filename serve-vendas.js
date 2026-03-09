const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3002;
const ROOT = __dirname;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css':  'text/css',
  '.js':   'application/javascript',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.svg':  'image/svg+xml',
  '.ico':  'image/x-icon',
  '.pdf':  'application/pdf',
};

http.createServer((req, res) => {
  let urlPath = req.url.split('?')[0];
  // Decodifica caracteres especiais na URL (ex: %C3%AA → ê)
  try { urlPath = decodeURIComponent(urlPath); } catch(e) {}
  if (urlPath === '/') urlPath = '/Pagina-de-vendas-index.html.html';

  const filePath = path.join(ROOT, urlPath);
  const ext = path.extname(filePath);
  const contentType = MIME[ext] || 'text/plain';

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end('Not found');
      return;
    }
    const headers = { 'Content-Type': contentType };
    // Força download para PDFs
    if (ext === '.pdf') {
      const filename = path.basename(filePath);
      headers['Content-Disposition'] = `attachment; filename="${filename}"`;
      headers['Content-Length'] = data.length;
    }
    res.writeHead(200, headers);
    res.end(data);
  });
}).listen(PORT, '0.0.0.0', () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
