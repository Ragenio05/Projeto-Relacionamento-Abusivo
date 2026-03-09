const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const CHROME_PATHS = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  process.env.LOCALAPPDATA + '\\Google\\Chrome\\Application\\chrome.exe',
];

function findChrome() {
  for (const p of CHROME_PATHS) {
    if (fs.existsSync(p)) return p;
  }
  throw new Error('Chrome não encontrado. Instale o Google Chrome.');
}

async function generatePDF() {
  const chromePath = findChrome();
  console.log('✅ Chrome encontrado:', chromePath);

  const htmlPath = path.resolve(__dirname, 'ebook-print.html');
  const pdfPath  = path.resolve(__dirname, 'voce-merece-ser-amada.pdf');

  console.log('🚀 Iniciando Chrome headless...');
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  });

  try {
    const page = await browser.newPage();

    // Viewport mobile (A5 ≈ 559px a 96dpi)
    await page.setViewport({ width: 559, height: 794, deviceScaleFactor: 1 });

    // Aguarda fontes do Google Fonts
    await page.setExtraHTTPHeaders({ 'Accept-Language': 'pt-BR,pt;q=0.9' });
    console.log('📄 Carregando HTML...');

    await page.goto(`file:///${htmlPath.replace(/\\/g, '/')}`, {
      waitUntil: 'networkidle0',
      timeout: 30000,
    });

    // Aguarda fontes renderizarem
    await new Promise(r => setTimeout(r, 2500));

    console.log('🖨️  Gerando PDF (formato A5 — otimizado para celular)...');
    await page.pdf({
      path: pdfPath,
      format: 'A5',
      printBackground: true,
      margin: { top: '0', right: '0', bottom: '0', left: '0' },
      preferCSSPageSize: true,
      displayHeaderFooter: false,
    });

    console.log('✅ PDF gerado com sucesso!');
    console.log('📁 Salvo em:', pdfPath);

    const stats = fs.statSync(pdfPath);
    const sizeMB = (stats.size / 1024 / 1024).toFixed(2);
    console.log(`📊 Tamanho: ${sizeMB} MB`);

  } finally {
    await browser.close();
  }
}

generatePDF().catch(err => {
  console.error('❌ Erro ao gerar PDF:', err.message);
  process.exit(1);
});
