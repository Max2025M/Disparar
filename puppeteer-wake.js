const puppeteer = require("puppeteer");
const https = require("https");

const SITE_URL = "https://texten-1kdb.onrender.com";
const UNLOCK_ENDPOINT = SITE_URL + "/desbloquear"; // endpoint que remove o 'limite'

// Envia POST para desbloquear o servidor Python
function enviarPostDesbloqueio() {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({ acao: "remover_limite" });

    const req = https.request(UNLOCK_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": data.length
      }
    }, (res) => {
      let body = "";
      res.on("data", chunk => body += chunk);
      res.on("end", () => {
        console.log("📬 Resposta completa do servidor Render:");
        console.log(body); // exibe a resposta diretamente
        if (body.toLowerCase().includes("sucesso") || res.statusCode === 200) {
          resolve(true);
        } else {
          reject(new Error("❌ Servidor respondeu mas não confirmou desbloqueio."));
        }
      });
    });

    req.on("error", (err) => {
      reject(err);
    });

    req.write(data);
    req.end();
  });
}

(async () => {
  console.log("🌐 Verificando se o Render está ativo:", SITE_URL);

  try {
    const browser = await puppeteer.launch({ headless: "new", args: ["--no-sandbox"] });
    const page = await browser.newPage();
    page.setDefaultNavigationTimeout(60000);

    const response = await page.goto(SITE_URL, { waitUntil: "domcontentloaded" });

    if (response && response.ok()) {
      console.log(`✅ Render está online com status ${response.status()}. Nenhuma ação necessária.`);
      await browser.close();
      return;
    } else {
      console.log(`⚠️ Render respondeu com status ${response ? response.status() : "sem resposta"}.`);
    }

    console.log("📤 Enviando POST para desbloquear Render...");
    await enviarPostDesbloqueio();
    console.log("✅ Palavra 'limite' removida com sucesso.");

    console.log("⏳ Aguardando 10 segundos antes de sair...");
    await new Promise(resolve => setTimeout(resolve, 10000));

    await browser.close();
    console.log("✅ Finalizado.");
  } catch (err) {
    console.error("❌ Erro durante execução:", err.message);
    process.exit(1);
  }
})();
