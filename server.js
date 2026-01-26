const express = require("express");

const app = express();
let panzerKills = "—";

async function updatePanzer() {
  try {
    const res = await fetch(
      "https://www.pubglooker.com/player/ChuvisTV",
      {
        headers: {
          "user-agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
        }
      }
    );

    const html = await res.text();

    // extrai o JSON do Next.js
    const match = html.match(
      /<script id="__NEXT_DATA__" type="application\/json">(.*?)<\/script>/
    );

    if (!match) {
      console.log("❌ __NEXT_DATA__ não encontrado");
      return;
    }

    const data = JSON.parse(match[1]);

    // navega no JSON (estrutura do pubglooker)
    const weapons =
      data?.props?.pageProps?.weaponMastery?.weapons;

    if (!weapons) {
      console.log("❌ Weapon mastery não encontrado");
      return;
    }

    const panzer = weapons.find(w =>
      w.name.toLowerCase().includes("panzer")
    );

    if (!panzer) {
      console.log("❌ Panzer não encontrado");
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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Servidor rodando na porta", PORT);
  updatePanzer();
  setInterval(updatePanzer, 20 * 60 * 1000); // 20 min
});
