import chromium from "@sparticuz/chromium";
import { chromium as playwright } from "playwright-core";

let cacheValue = null;
let cacheTime = 0;

export default async function handler(req, res) {
  // cache de 15 minutos
  if (cacheValue && Date.now() - cacheTime < 15 * 60 * 1000) {
    res.setHeader("Content-Type", "text/plain");
    return res.status(200).send(cacheValue);
  }

  const browser = await playwright.launch({
    args: chromium.args,
    executablePath: await chromium.executablePath(),
    headless: true
  });

  const page = await browser.newPage();

  await page.goto("https://www.pubglooker.com/player/ChuvisTV", {
    waitUntil: "networkidle"
  });

  // clica na aba Weapon Mastery
  await page.click("text=Weapon Mastery");
  await page.waitForTimeout(3000);

  const kills = await page.evaluate(() => {
    const elements = Array.from(document.querySelectorAll("*"));
    const panzer = elements.find(el =>
      el.innerText.includes("PanzerFaust100M")
    );

    if (!panzer) return null;

    const match = panzer.innerText.match(/([\d.,]+)\s*Kills/i);
    return match ? match[1] : null;
  });

  await browser.close();

  if (!kills) {
    return res.status(500).send("ERR");
  }

  cacheValue = kills;
  cacheTime = Date.now();

  res.setHeader("Content-Type", "text/plain");
  res.status(200).send(kills);
}
