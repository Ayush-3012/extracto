import { getPineconeIndex } from "./src/utils/pinecone.js";

const test = async () => {
  try {
    console.log("⏳ Connecting to Pinecone...");

    const index = await getPineconeIndex();

    console.log("🔥 Connected to index:", process.env.PINECONE_INDEX);

    const stats = await index.describeIndexStats();
    console.log("📊 Stats:", stats);
  } catch (err) {
    console.error("❌ Pinecone Test Error:", err);
  }
};

await test();
