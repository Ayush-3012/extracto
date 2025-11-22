import { generateEmbedding } from "./embedder.js";

export async function embedQuery(query) {
  if (!query?.trim().length) throw new Error("Query text is empty");

  try {
    const embedding = await generateEmbedding(query);
    return embedding;
  } catch (error) {
    console.error("❌ Error embedding query:", error);
    throw error;
  }
}
