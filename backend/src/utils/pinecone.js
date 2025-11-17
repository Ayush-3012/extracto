import pkg from "@pinecone-database/pinecone";
import dotenv from "dotenv";
dotenv.config();

const { Pinecone } = pkg;

let pineconeClient = null;

export async function getPineconeClient() {
  if (!pineconeClient) {
    pineconeClient = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY,
    });

    console.log("✅ Pinecone client initialized");
  }

  return pineconeClient;
}

// export async function getPineconeIndex() {
//   const client = await getPineconeClient();
//   return client.Index(process.env.PINECONE_INDEX);
// }
