const puppeteer = require("puppeteer");

(async () => {
  const url = "https://texten-1kdb.onrender.com";
  console.log("🌐 Acessando:", url);

  try {
    const browser = await puppeteer.launch({ headless: "new", args: ['--no-sandbox'] });
    const page = await browser.newPage();

    page.setDefaultNavigationTimeout(30000); // timeout de 30s

    const response = await page.goto(url, { waitUntil: 'networkidle2' });

    if (response && response.ok()) {
      console.log("✅ Render acordou e respondeu com sucesso (HTTP", response.status(), ")");
    } else {
      console.error("⚠️ Página acessada mas com status inválido:", response ? response.status() : "N/A");
      process.exit(1);
    }

    // Aguarda 5 segundos (substituindo page.waitForTimeout)
    await new Promise(resolve => setTimeout(resolve, 5000));

    await browser.close();
  } catch (err) {
    console.error("❌ Erro ao acessar o site via Puppeteer:", err.message);
    process.exit(1);
  }
})();
