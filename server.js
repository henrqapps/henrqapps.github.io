const express = require("express");
const puppeteer = require("puppeteer-core");
const chromium = require("@sparticuz/chromium");

const app = express();
let panzerKills = "—";

async function updatePanzer() {
  try {
    const browser = await puppeteer.launch({
      args: [
        ...chromium.args,
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
        "--single-process"
      ],
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless
    });

    const page = await browser.newPage();

    // 🚀 bloqueia APENAS imagens e mídia
    await page.setRequestInterception(true);
    page.on("request", req => {
      const type = req.resourceType();
      if (["image", "media"].includes(type)) {
        req.abort();
      } else {
        req.continue();
      }
    });

    await page.goto(
      "https://www.pubglooker.com/player/ChuvisTV",
      {
        waitUntil: "domcontentloaded",
        timeout: 60000
      }
    );

    // ⏳ espera os cards aparecerem (sem clicar em aba)
    await page.waitForSelector(".stat-card", { timeout: 45000 });

    const result = await page.evaluate(() => {
      const cards = document.querySelectorAll(".stat-card");

      for (const card of cards) {
        const nameEl = card.querySelector("h5");
        if (!nameEl) continue;

        if (nameEl.innerText.toLowerCase().includes("panzer")) {
          const badge = card.querySelector(".badge");
          return badge ? badge.innerText.replace(/\D/g, "") : null;
        }
      }
      return null;
    });

    if (result) {
      panzerKills = result;
      console.log("🔥 Panzer kills:", panzerKills);
    } else {
      console.log("⚠️ Panzer não encontrado no DOM");
    }

    await browser.close();
  } catch (err) {
    console.error("❌ Erro ao atualizar Panzer:", err.message);
  }
}

// rota pro OBS
app.get("/panzer", (req, res) => {
  res.set("Access-Control-Allow-Origin", "*");
  res.send(panzerKills);
});

// porta do Render
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Servidor rodando na porta", PORT);
  updatePanzer();
  setInterval(updatePanzer, 20 * 60 * 1000); // 20 minutos
});
