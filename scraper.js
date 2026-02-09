const fs = require("fs");
const puppeteer = require("puppeteer");

function findPanzer(obj) {
  if (!obj) return null;

  if (Array.isArray(obj)) {
    for (const item of obj) {
      const found = findPanzer(item);
      if (found) return found;
    }
  } else if (typeof obj === "object") {
    const values = Object.values(obj);

    // tentativa direta
    if (
      obj.weaponName &&
      typeof obj.weaponName === "string" &&
      obj.weaponName.toLowerCase().includes("panzer")
    ) {
      return obj.kills ?? obj.kill ?? obj.stats?.kills ?? null;
    }

    // varre tudo recursivamente
    for (const val of values) {
      const found = findPanzer(val);
      if (found !== null) return found;
    }
  }

  return null;
}

(async () => {
  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"]
  });

  const page = await browser.newPage();

  let panzerKills = null;

  page.on("response", async (response) => {
    try {
      const ct = response.headers()["content-type"] || "";
      if (!ct.includes("application/json")) return;

      const data = await response.json();
      const found = findPanzer(data);

      if (found !== null) {
        panzerKills = String(found);
      }
    } catch (e) {}
  });

  await page.goto(
    "https://www.pubglooker.com/player/ChuvisTV",
    { waitUntil: "networkidle2" }
  );

  const start = Date.now();
  while (!panzerKills && Date.now() - start < 60000) {
    await new Promise(r => setTimeout(r, 500));
  }

  await browser.close();

  if (!panzerKills) panzerKills = "0";

  const template = fs.readFileSync("panzer.template.html", "utf8");
  const finalHtml = template.replace("{{PANZER_KILLS}}", panzerKills);

  fs.writeFileSync("panzer.html", finalHtml);

  console.log("Panzer Kills FINAL:", panzerKills);
})();
