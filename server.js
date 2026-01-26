const express = require("express");
const fetch = require("node-fetch");

const app = express();
let panzerKills = "—";

const PLAYER = "ChuvisTV";

// função de atualização
async function updatePanzer() {
  try {
    const res = await fetch(
      `https://api.pubglookup.com/api/player/steam/${PLAYER}`,
      {
        headers: {
          "User-Agent": "Mozilla/5.0",
          "Accept": "application/json"
        }
      }
    );

    if (!res.ok) throw new Error("Falha ao acessar API");

    const data = await res.json();

    // procura arma Panzerfaust
    const weapons = data.weaponMastery || [];

    const panzer = weapons.find(w =>
      w.weaponName?.toLowerCase().includes("panzer")
    );

    if (panzer && panzer.kills !== undefined) {
      panzerKills = panzer.kills.toString();
      console.log("🔥 Panzer kills:", panzerKills);
    } else {
      console.warn("⚠️ Panzer não encontrado na API");
    }

  } catch (err) {
    console.error("❌ Erro ao atualizar Panzer:", err.message);
  }
}

// rota para o OBS
app.get("/panzer", (req, res) => {
  res.set("Access-Control-Allow-Origin", "*");
  res.send(panzerKills);
});

// start
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Servidor rodando na porta", PORT);
  updatePanzer();
  setInterval(updatePanzer, 20 * 60 * 1000); // 20 min
});
