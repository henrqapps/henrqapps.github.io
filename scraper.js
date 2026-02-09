const fs = require("fs");
const puppeteer = require("puppeteer");

(async () => {
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

  await page.waitForTimeout(1500);

  const panzerKills = await page.evaluate(() => {
    const cards = document.querySelectorAll("#pills-wm-overview .stat-card");

    for (const card of cards) {
      const nameEl = card.querySelector("h5");
      if (!nameEl) continue;

      if (nameEl.innerText.toLowerCase().includes("panzer")) {
        const badge = card.querySelector(".badge");
        return badge ? badge.innerText.replace(/\D/g, "") : "—";
      }
    }
    return "—";
  });

  await browser.close();

  const template = fs.readFileSync("panzer.template.html", "utf8");
  const finalHtml = template.replace("{{PANZER_KILLS}}", panzerKills);

  fs.writeFileSync("panzer.html", finalHtml);

  console.log("Panzer Kills atualizado:", panzerKills);
})();
