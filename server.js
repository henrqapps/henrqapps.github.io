const express = require("express");
const fetch = require("node-fetch");

const app = express();
let panzerKills = "—";

async function updatePanzer() {
  try {
    const res = await fetch(
      "https://www.pubglooker.com/player/ChuvisTV",
      {
        headers: {
          "user-agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "accept":
            "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
          "accept-language": "en-US,en;q=0.9",
          "cache-control": "no-cache",
          "pragma": "no-cache"
        }
      }
    );

    const html = await res.text();

    const match = html.match(
      /<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/
    );

    if (!match) {
      console.log("⚠️ __NEXT_DATA__ não encontrado");
      return;
    }

    const data = JSON.parse(match[1]);

    const weapons =
      data?.props?.pageProps?.weaponMastery?.weapons;

    if (!weapons) {
      console.log("⚠️ Weapon mastery não encontrado");
      return;
    }

    const panzer = weapons.find(w =>
      w.name?.toLowerCase().includes("panzer")
    );

    if (!panzer) {
      console.log("⚠️ Panzer não encontrado no JS");
      return;
    }

    panzerKills = String(panzer.kills);
    console.log("🔥 Panzer kills:", panzerKills);

  } catch (err) {
    console.error("❌ Erro ao atualizar Panzer:", err.message);
  }
}

// rota pro OBS
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
