const express = require("express");
const puppeteer = require("puppeteer");

const app = express();
let panzerKills = "—";

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function updatePanzer() {
  try {
    const browser = await puppeteer.launch({
      headless: "new",
      args: ["--no-sandbox", "--disable-setuid-sandbox"]
    });

    const page = await browser.newPage();

    await page.goto(
      "https://www.pubglooker.com/player/ChuvisTV",
      { waitUntil: "networkidle2" }
    );

    await page.waitForSelector("#weapon-mastery-tab", { timeout: 15000 });
    await page.click("#weapon-mastery-tab");

    await page.waitForSelector("#pills-wm-overview .stat-card", {
      timeout: 15000
    });

    await sleep(1500);

    const result = await page.evaluate(() => {
      const cards = document.querySelectorAll(
        "#pills-wm-overview .stat-card"
      );

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
      console.log("Panzer kills:", panzerKills);
    }

    await browser.close();
  } catch (err) {
    console.error("Erro ao atualizar Panzer:", err.message);
  }
}

app.get("/panzer", (req, res) => {
  res.set("Content-Type", "text/html");
  res.send(`
<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8" />
<title>Panzer Kills</title>
<style>
  body {
    margin: 0;
    background: transparent;
  }

  .container {
    position: relative;
    width: 1920px;
    height: 360px;
    background-image: url("https://raw.githubusercontent.com/henrqapps/henrqapps.github.io/refs/heads/main/PanzerKills_Banner.png");
    background-size: contain;
    background-repeat: no-repeat;
    background-position: center;
  }

  .kills {
    position: absolute;

    /* AJUSTE FINO DO BALÃO 👇 */
    right: 140px;
    top: 80px;
    width: 420px;
    height: 200px;

    display: flex;
    align-items: center;
    justify-content: center;

    font-family: Impact, "Arial Black", sans-serif;
    font-size: 120px;
    font-weight: 900;
    color: #ffffff;

    text-shadow:
      0 0 6px rgba(0,0,0,0.9),
      0 0 14px rgba(255,140,0,0.9),
      0 0 28px rgba(255,80,0,1);
  }
</style>
</head>
<body>
  <div class="container">
    <div class="kills">${panzerKills}</div>
  </div>
</body>
</html>
  `);
});

// inicia
app.listen(3000, () => {
  console.log("Servidor rodando na porta 3000");
  updatePanzer();
  setInterval(updatePanzer, 2 * 60 * 60 * 1000); // 2 horas
});
