export default async function handler(req, res) {
  try {
    const response = await fetch(
      "https://www.pubglooker.com/api/player/weapon-mastery/ChuvisTV",
      {
        headers: {
          "User-Agent": "Mozilla/5.0",
          "Accept": "application/json"
        }
      }
    );

    const data = await response.json();

    // Procura Panzerfaust dentro da lista
    const panzer = data.weapons.find(
      w => w.name.toLowerCase().includes("panzer")
    );

    if (!panzer) {
      return res.status(500).send("Panzer not found");
    }

    const kills = panzer.kills;

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Cache-Control", "s-maxage=60");
    res.status(200).send(String(kills));

  } catch (err) {
    res.status(500).send("error");
  }
}
