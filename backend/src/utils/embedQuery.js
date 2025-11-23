import { generateEmbedding } from "./embedder.js";

export async function embedQuery(query) {
  if (!query?.trim()) throw new Error("Query text is empty");
  return await generateEmbedding(query);
}
