const puppeteer = require("puppeteer");

(async () => {
  const url = "https://texten-1kdb.onrender.com";
  console.log("🌐 Acessando:", url);

  try {
    const browser = await puppeteer.launch({ headless: "new", args: ["--no-sandbox"] });
    const page = await browser.newPage();

    // Aumenta o tempo de navegação para dar tempo ao Render
    page.setDefaultNavigationTimeout(60000); // 1 minuto

    const response = await page.goto(url, { waitUntil: "domcontentloaded" });

    if (response && response.ok()) {
      console.log("✅ Navegador acessou com sucesso:", response.status());
    } else {
      console.error("⚠️ Página acessada mas com status inválido:", response ? response.status() : "sem resposta");
    }

    // Aguarda 15 segundos com o navegador aberto
    console.log("⏳ Aguardando 15 segundos para Render acordar...");
    await new Promise(resolve => setTimeout(resolve, 15000));

    // Tenta acessar algum conteúdo da página (força renderização e JS)
    const content = await page.evaluate(() => document.body.innerText || "Sem conteúdo no body");

    console.log("📄 Conteúdo recebido (resumo):", content.slice(0, 100).replace(/\s+/g, " "), "...");

    await browser.close();
    console.log("✅ Finalizado com sucesso.");
  } catch (err) {
    console.error("❌ Erro durante acesso via Puppeteer:", err.message);
    process.exit(1);
  }
})();
