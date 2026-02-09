const fs = require("fs");
const puppeteer = require("puppeteer");

(async () => {
  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"]
  });

  const page = await browser.newPage();

  let panzerKills = null;

  // Intercepta respostas da API
  page.on("response", async (response) => {
    try {
      const url = response.url();

      // endpoint interno do PUBG Looker (weapon mastery)
      if (url.includes("/weapon-masteries")) {
        const data = await response.json();

        for (const weapon of data) {
          if (
            weapon.weaponName &&
            weapon.weaponName.toLowerCase().includes("panzer")
          ) {
            panzerKills = String(weapon.kills ?? 0);
          }
        }
      }
    } catch (e) {}
  });

  await page.goto(
    "https://www.pubglooker.com/player/ChuvisTV",
    { waitUntil: "networkidle2" }
  );

  // aguarda até capturar ou timeout
  const start = Date.now();
  while (!panzerKills && Date.now() - start < 60000) {
    await new Promise(r => setTimeout(r, 500));
  }

  await browser.close();

  // fallback seguro
  if (!panzerKills) panzerKills = "0";

  const template = fs.readFileSync("panzer.template.html", "utf8");
  const finalHtml = template.replace("{{PANZER_KILLS}}", panzerKills);

  fs.writeFileSync("panzer.html", finalHtml);

  console.log("Panzer Kills FINAL:", panzerKills);
})();
