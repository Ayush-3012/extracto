import axios from "axios";
import Groq from "groq-sdk";
import dotenv from "dotenv";
dotenv.config();

const client = new Groq({ apiKey: process.env.GROQ_API_KEY });
// const MODEL = process.env.GROQ_MODEL || "llama-3.1-8b-instant";

export async function askLLM(prompt) {
  try {
    const completion = await client.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "system",
          content: "Return ONLY valid JSON. No text, no comments.",
        },
        { role: "user", content: prompt },
      ],
      response_format: { type: "json_object" },
    });

    return completion.choices[0].message.content;
  } catch (err) {
    console.error("❌ LLM Error:", err);
    return "{}";
  }
}

// export function buildExtractionPrompt(fieldName, context) {
//   return `
// Extract ONLY the value for: "${fieldName}"

// From this insurance policy text:

// ${context}

// Rules:
// - Only return the value (no explanation)
// - If not found, return "null"
// `;
// }
