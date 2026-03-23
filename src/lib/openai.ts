export const extractDataFromId = async (imageUrl: string) => {
  const res = await fetch("/api/openai/extract-data-from-id", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ imageUrl }),
  });

  if (!res.ok) {
    throw new Error(`OpenAI API error (${res.status})`);
  }

  const data = (await res.json()) as Record<string, unknown>;
  return { message: { content: JSON.stringify(data) } };
};

export const compareFaces = async (imageUrl1: string, imageUrl2: string) => {
  const res = await fetch("/api/openai/compare-faces", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ imageUrl1, imageUrl2 }),
  });

  if (!res.ok) {
    throw new Error(`OpenAI API error (${res.status})`);
  }

  const data = (await res.json()) as { score?: number };
  return { message: { content: String(data.score ?? "") } };
};
