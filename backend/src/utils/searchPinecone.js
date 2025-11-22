import { getPineconeClient } from "./pinecone.js";

export async function searchPinecone(queryEmbedding, topK = 5) {
  if (!queryEmbedding || !Array.isArray(queryEmbedding)) {
    throw new Error("Invalid query embedding");
  }

  try {
    const client = await getPineconeClient();
    const index = client.Index(process.env.PINECONE_INDEX);

    console.log("⏳ Searching Pinecone...");

    const response = await index.query({
      vector: queryEmbedding,
      topK,
      includeMetadata: true,
    });

    console.log("🔍 Search complete!");

    return response.matches || [];
  } catch (err) {
    console.error("❌ Pinecone Search Error:", err);
    throw err;
  }
}
