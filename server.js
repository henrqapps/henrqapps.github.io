const express = require("express");
const puppeteer = require("puppeteer-core");
const chromium = require("@sparticuz/chromium");

const app = express();
let panzerKills = "—";

const PLAYER_URL = "https://www.pubglooker.com/player/ChuvisTV";

async function updatePanzer() {
  let browser;

  try {
    browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless
    });

    const page = await browser.newPage();

    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36"
    );

    await page.goto(PLAYER_URL, {
      waitUntil: "domcontentloaded",
      timeout: 60000
    });

    // espera o React montar
    await page.waitForFunction(
      () => document.body.innerText.includes("Weapon"),
      { timeout: 60000 }
    );

    // força clicar na aba
    await page.evaluate(() => {
      const tabs = [...document.querySelectorAll("button, a")];
      const wm = tabs.find(t =>
        t.innerText.toLowerCase().includes("weapon")
      );
      if (wm) wm.click();
    });

    // espera os cards aparecerem
    await page.waitForFunction(
      () =>
        [...document.querySelectorAll("h5")]
          .some(el => el.innerText.toLowerCase().includes("panzer")),
      { timeout: 60000 }
    );

    const kills = await page.evaluate(() => {
      const cards = document.querySelectorAll("div");
      for (const card of cards) {
        if (card.innerText?.toLowerCase().includes("panzer")) {
          const match = card.innerText.match(/(\d[\d.,]*)\s*kills/i);
          if (match) return match[1].replace(/\D/g, "");
        }
      }
      return null;
    });

    if (kills) {
      panzerKills = kills;
      console.log("🔥 Panzer kills:", panzerKills);
    } else {
      console.warn("⚠️ Panzer não encontrado");
    }

  } catch (err) {
    console.error("❌ Erro ao atualizar Panzer:", err.message);
  } finally {
    if (browser) await browser.close();
  }
}

// rota OBS
app.get("/panzer", (req, res) => {
  res.set("Access-Control-Allow-Origin", "*");
  res.send(panzerKills);
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log("Servidor rodando na porta", PORT);
  updatePanzer();
  setInterval(updatePanzer, 20 * 60 * 1000);
});
