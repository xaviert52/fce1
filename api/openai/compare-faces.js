import OpenAI from "openai";

const json = (res, status, body) => {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(body));
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return json(res, 405, { error: "Method Not Allowed" });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return json(res, 500, { error: "Missing OPENAI_API_KEY" });
  }

  let body;
  try {
    body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
  } catch {
    body = null;
  }

  const imageUrl1 = body?.imageUrl1;
  const imageUrl2 = body?.imageUrl2;
  if (!imageUrl1 || typeof imageUrl1 !== "string" || !imageUrl2 || typeof imageUrl2 !== "string") {
    return json(res, 400, { error: "Missing imageUrl1 or imageUrl2" });
  }

  const openai = new OpenAI({ apiKey });

  try {
    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_VISION_MODEL || "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Compara los rostros en las dos imágenes y devuelve un puntaje de similitud en una escala de 0 a 100. Responde SOLO con el número (sin %, sin texto adicional).",
            },
            { type: "image_url", image_url: { url: imageUrl1 } },
            { type: "image_url", image_url: { url: imageUrl2 } },
          ],
        },
      ],
    });

    const content = response.choices?.[0]?.message?.content;
    if (!content || typeof content !== "string") {
      return json(res, 502, { error: "Empty model response" });
    }

    const score = Number.parseInt(content.trim(), 10);
    if (!Number.isFinite(score)) {
      return json(res, 502, { error: "Non-numeric model response" });
    }

    const normalized = Math.max(0, Math.min(100, score));
    return json(res, 200, { score: normalized });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return json(res, 502, { error: message });
  }
}
