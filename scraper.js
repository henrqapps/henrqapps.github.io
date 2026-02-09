const fs = require("fs");
const puppeteer = require("puppeteer");

async function waitForPanzer(page, timeout = 30000) {
  const start = Date.now();

  while (Date.now() - start < timeout) {
    const result = await page.evaluate(() => {
      const cards = document.querySelectorAll(".stat-card");

      for (const card of cards) {
        const nameEl = card.querySelector("h5");
        if (!nameEl) continue;

        if (nameEl.innerText.toLowerCase().includes("panzer")) {
          const badge = card.querySelector(".badge");
          return badge ? badge.innerText.replace(/\D/g, "") : "—";
        }
      }
      return null;
    });

    if (result) return result;
    await new Promise(r => setTimeout(r, 1000));
  }

  return "—";
}

(async () => {
  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"]
  });

  const page = await browser.newPage();

  await page.goto(
    "https://www.pubglooker.com/player/ChuvisTV",
    { waitUntil: "domcontentloaded" }
  );

  // força abrir aba Weapon Mastery via hash (mais confiável)
  await page.goto(
    "https://www.pubglooker.com/player/ChuvisTV#weapon-mastery",
    { waitUntil: "domcontentloaded" }
  );

  const panzerKills = await waitForPanzer(page);

  await browser.close();

  const template = fs.readFileSync("panzer.template.html", "utf8");
  const finalHtml = template.replace("{{PANZER_KILLS}}", panzerKills);

  fs.writeFileSync("panzer.html", finalHtml);

  console.log("Panzer Kills atualizado:", panzerKills);
})();
