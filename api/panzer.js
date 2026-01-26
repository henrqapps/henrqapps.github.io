export default async function handler(req, res) {
  try {
    const response = await fetch(
      "https://www.pubglooker.com/player/ChuvisTV",
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
        },
      }
    );

    const html = await response.text();

    // Procura "Panzerfaust" seguido de "kills"
    const match = html.match(
      /Panzerfaust[\s\S]*?(\d{1,6})\s*kills/i
    );

    if (!match) {
      return res.status(500).send("Panzer not found");
    }

    const kills = match[1];

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Cache-Control", "s-maxage=60");
    res.status(200).send(kills);

  } catch (err) {
    res.status(500).send("error");
  }
}
