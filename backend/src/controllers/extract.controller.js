import { embedQuery } from "../utils/embedQuery.js";
import { searchPinecone } from "../utils/searchPinecone.js";
import { loadTemplate } from "../utils/loadTemplate.js";
import { askLLM } from "../utils/llm.js";
import File from "../models/file.model.js";

export const extractFields = async (req, res) => {
  try {
    const { fileId, carrier, product } = req.body;

    if (!fileId || !carrier || !product) {
      return res.status(400).json({
        success: false,
        message: "fileId, carrier, product required",
      });
    }

    // Load template
    const template = loadTemplate(carrier, product);

    if (!template || !template.groups) {
      return res.status(400).json({
        success: false,
        message: "Template groups not found",
      });
    }

    // File check
    const fileData = await File.findById(fileId);
    if (!fileData) {
      return res
        .status(404)
        .json({ success: false, message: "File not found" });
    }

    console.log("🔍 Starting extraction for:", carrier, product);

    const finalOutput = {};

    for (const [groupName, groupFields] of Object.entries(template.groups)) {
      console.log(`\n📌 Extracting Group → ${groupName}`);

      const combinedQuery = `
      Extract the following fields from a ${carrier} ${product} policy:
      ${Object.keys(groupFields).join(", ")}
      `;

      const queryEmbedding = await embedQuery(combinedQuery);

      const matches = await searchPinecone(queryEmbedding, 3);
      const context = matches
        .map((m) => m.metadata.text)
        .join("\n")
        .slice(0, 4000);

      const prompt = `
You are an insurance policy analyzer. 
Extract the following fields from the text.

FIELDS:
${Object.keys(groupFields).join("\n")}

TEXT:
""" 
${context} 
"""

Return STRICT JSON only. 
No explanation. No extra text.

JSON FORMAT:
{
${Object.keys(groupFields)
  .map((f) => `  "${f}": ""`)
  .join(",\n")}
}

Rules:
- Fill each field with short extracted value
- If not found, set empty string ""
- DO NOT include comments or sentences
- DO NOT wrap JSON in code blocks
- DO NOT modify key names
- MUST return valid JSON the parser can read
`;

      const llmResponse = await askLLM(prompt);

      let parsed = {};
      try {
        parsed = JSON.parse(llmResponse);
      } catch (err) {
        console.log("⚠ JSON Parse failed, returning nulls");
        for (const f of Object.keys(groupFields)) {
          parsed[f] = null;
        }
      }

      finalOutput[groupName] = parsed;
    }

    return res.json({
      success: true,
      data: finalOutput,
    });
  } catch (err) {
    console.error("❌ Extraction error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};
