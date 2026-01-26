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

    // bloqueia peso
    await page.setRequestInterception(true);
    page.on("request", req => {
      const type = req.resourceType();
      if (["image", "font", "stylesheet", "media"].includes(type)) {
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

    // 🧠 pega direto do JS da página
    const result = await page.evaluate(() => {
      // procura qualquer objeto grande com weapon mastery
      for (const key in window) {
        try {
          const value = window[key];

          if (
            value &&
            typeof value === "object" &&
            JSON.stringify(value).includes("Panzerfaust")
          ) {
            const json = JSON.stringify(value);
            const match = json.match(/Panzerfaust[^0-9]*([0-9]{1,5})/i);
            if (match) return match[1];
          }
        } catch (_) {}
      }
      return null;
    });

    if (result) {
      panzerKills = result;
      console.log("🔥 Panzer kills:", panzerKills);
    } else {
      console.log("⚠️ Panzer não encontrado no JS");
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

// porta Render
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Servidor rodando na porta", PORT);
  updatePanzer();
  setInterval(updatePanzer, 20 * 60 * 1000); // 20 min
});
