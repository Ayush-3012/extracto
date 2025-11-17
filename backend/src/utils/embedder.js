import { pipeline } from "@xenova/transformers";

let embedder = null;

async function loadModel() {
  if (!embedder) {
    console.log("⏳ Loading embedding model (Xenova/all-MiniLM-L6-v2)...");
    embedder = await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2");
    console.log("✅ Embedding model loaded!");
  }

  return embedder;
}

export async function generateEmbedding(text) {
  if (!text?.trim().length === 0) return null;

  const model = await loadModel();
  const raw = await model(text, {
    pooling: "mean",
    normalize: true,
  });

  const embedding = Array.from(raw.data);
  return embedding;
}

export async function embedChunks(chunks = []) {
  const vectors = [];
  for (let i = 0; i < chunks.length; i++) {
    const emb = await generateEmbedding(chunks[i]);
    vectors.push(emb);
  }

  return vectors;
}
