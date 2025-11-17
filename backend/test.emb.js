import { generateEmbedding } from "./src/utils/embedder.js";

const text = "This is a test sentence from Extracto.";
const emb = await generateEmbedding(text);

console.log("Embedding length:", emb.length);
console.log("Sample values:", emb.slice(0, 10));
