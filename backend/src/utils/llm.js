import axios from "axios";
import Groq from "groq-sdk";
import dotenv from "dotenv";
dotenv.config();

const client = new Groq({ apiKey: process.env.GROQ_API_KEY });
const MODEL = process.env.GROQ_MODEL || "llama-3.1-8b-instant";

export async function askLLM(prompt) {
  try {
    const res = await client.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: "system",
          content: "You are an insurance policy extraction expert.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.1,
      max_tokens: 200,
    });

    return res.choices[0].message.content;
  } catch (err) {
    console.error("❌ LLM Error:", err.response?.data || err.message);
    return null;
  }
}

export function buildExtractionPrompt(fieldName, context) {
  return `
Extract ONLY the value for: "${fieldName}"

From this insurance policy text:

${context}

Rules:
- Only return the value (no explanation)
- If not found, return "null"
`;
}
