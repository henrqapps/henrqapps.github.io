export default async function handler(req, res) {
  try {
    const target =
      "https://textise.net/showtext.aspx?strURL=https://www.pubglooker.com/player/ChuvisTV";

    const response = await fetch(target);
    const text = await response.text();

    // Agora o conteúdo vem renderizado
    const match = text.match(
      /Panzerfaust\s+(\d+)\s+kills/i
    );

    if (!match) {
      return res.status(500).send("Panzer not found");
    }

    const kills = match[1];

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Cache-Control", "s-maxage=60");
    res.status(200).send(kills);

  } catch (e) {
    res.status(500).send("error");
  }
}
