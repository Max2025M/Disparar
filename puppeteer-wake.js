const puppeteer = require('puppeteer');

const URL_RENDER = "https://texten-1kdb.onrender.com";

async function verificarRender() {
  try {
    console.log(`🔵 Acessando Render: ${URL_RENDER}`);

    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.goto(URL_RENDER, {
      waitUntil: 'networkidle2',
      timeout: 60000
    });

    // Esperar para garantir que scripts JS sejam executados
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Extrair texto puro da página
    const conteudo = await page.evaluate(() => document.body.textContent.trim());

    console.log(`📋 Resposta do Render: ${conteudo}`);

    await browser.close();
    return true;
  } catch (err) {
    if (err.name === 'TimeoutError') {
      console.error("⏰ Tempo excedido ao tentar acessar o Render.");
    } else {
      console.error(`❌ Erro ao acessar o Render: ${err}`);
    }
    return false;
  }
}

verificarRender();
