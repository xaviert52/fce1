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

  const imageUrl = body?.imageUrl;
  if (!imageUrl || typeof imageUrl !== "string") {
    return json(res, 400, { error: "Missing imageUrl" });
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
              text: "Extrae los siguientes datos de la imagen de la cédula: nombres, apellido1, apellido2, direccion, ciudad, pais, ruc. Si no encuentras la ciudad, usa 'Quito'. Devuelve SOLO JSON válido con esas llaves y valores string. Sin markdown, sin texto adicional.",
            },
            { type: "image_url", image_url: { url: imageUrl } },
          ],
        },
      ],
    });

    const content = response.choices?.[0]?.message?.content;
    if (!content || typeof content !== "string") {
      return json(res, 502, { error: "Empty model response" });
    }

    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch {
      return json(res, 502, { error: "Non-JSON model response" });
    }

    return json(res, 200, parsed);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return json(res, 502, { error: message });
  }
}
