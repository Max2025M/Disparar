const puppeteer = require("puppeteer");
const https = require("https");

const SITE_URL = "https://texten-1kdb.onrender.com";
const UNLOCK_ENDPOINT = SITE_URL + "/desbloquear";

// Envia POST para desbloquear o servidor Python (Render)
function enviarPostDesbloqueio() {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({ acao: "remover_limite" });

    const req = https.request(UNLOCK_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(data),
      },
    }, (res) => {
      let body = "";
      res.on("data", chunk => body += chunk);
      res.on("end", () => {
        console.log("📬 Resposta do POST /desbloquear:");
        console.log(body);
        if (res.statusCode === 200 || body.toLowerCase().includes("sucesso")) {
          resolve(true);
        } else {
          reject(new Error("❌ POST respondeu, mas sem confirmação de sucesso."));
        }
      });
    });

    req.on("error", reject);
    req.write(data);
    req.end();
  });
}

(async () => {
  console.log("🌐 Verificando status do Render:", SITE_URL);

  const browser = await puppeteer.launch({ headless: "new", args: ["--no-sandbox"] });
  const page = await browser.newPage();
  page.setDefaultNavigationTimeout(60000); // aguarda até 60 segundos

  try {
    const response = await page.goto(SITE_URL, { waitUntil: "domcontentloaded" });

    if (response && response.ok()) {
      console.log(`✅ Render está online (status ${response.status()})`);
      await browser.close();
      return;
    } else {
      console.warn(`⚠️ Status inesperado (${response ? response.status() : "sem resposta"}). Provavelmente dormindo...`);
    }
  } catch (err) {
    console.warn("⚠️ Erro ao acessar Render. Pode estar dormindo:", err.message);
  }

  // Envia POST para tentar desbloquear
  try {
    console.log("📤 Enviando POST /desbloquear...");
    await enviarPostDesbloqueio();
    console.log("✅ Desbloqueio solicitado com sucesso.");
  } catch (err) {
    console.error("❌ Falha ao enviar POST:", err.message);
  }

  // Aguarda o Render acordar
  console.log("⏳ Aguardando Render acordar...");

  try {
    await page.goto(SITE_URL, { waitUntil: "domcontentloaded", timeout: 60000 });
    console.log("✅ Render acordou e respondeu com sucesso!");
  } catch (err) {
    console.error("❌ Render não acordou em até 1 minuto:", err.message);
  }

  await browser.close();
  console.log("✅ Finalizado.");
})();
