import { getPineconeClient } from "./pinecone.js";

export async function upsertChunksToPinecone({
  fileId,
  chunks,
  embeddings,
  carrier = null,
  product = null,
}) {
  try {
    const client = await getPineconeClient();
    const index = client.Index(process.env.PINECONE_INDEX);

    if (!Array.isArray(chunks) || !Array.isArray(embeddings)) {
      throw new Error("Chunks or embeddings are not arrays");
    }

    if (chunks.length !== embeddings.length) {
      throw new Error("Chunks count and embeddings count do not match");
    }

    console.log(`⏳ Preparing ${chunks.length} vectors for upsert...`);

    const vectors = embeddings.map((values, i) => ({
      id: `${fileId}-chunk-${i}`,
      values,
      metadata: {
        fileId,
        chunkIndex: i,
        carrier,
        product,
        text: chunks[i],
      },
    }));

    console.log("⏳ Upserting vectors to Pinecone...");
    await index.upsert(vectors);

    console.log("🔥 Pinecone upsert complete!");
    return { success: true, vectors: vectors.length };
  } catch (err) {
    console.error("❌ Pinecone Upsert Error:", err);
    return { success: false, error: err.message };
  }
}
