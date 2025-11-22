import { embedQuery } from "../utils/embedQuery.js";
import { searchPinecone } from "../utils/searchPinecone.js";
import { loadTemplate } from "../utils/loadTemplate.js";
import { askLLM, buildExtractionPrompt } from "../utils/llm.js";
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

    // 1) Load template for LTD / STD etc.
    const template = loadTemplate(carrier, product);

    // 2) Make sure file exists in DB
    const fileData = await File.findById(fileId);
    if (!fileData) {
      return res
        .status(404)
        .json({ success: false, message: "File not found" });
    }

    console.log("🔍 Starting extraction for:", carrier, product);
    const results = {};

    // 3) Loop over template fields
    for (const fieldName in template.fields) {
      const fieldConfig = template.fields[fieldName];

      // Build semantic query
      const query = `Extract the ${fieldName} from this ${carrier} ${product} insurance policy.`;

      // 3.1) Convert query to embedding
      const queryEmbedding = await embedQuery(query);

      // 3.2) Pinecone search for relevant chunks
      const matches = await searchPinecone(queryEmbedding, 5);

      // 3.3) Combine matching chunk texts
      const context = matches.map((m) => m.metadata.text).join("\n");

      // 3.4) Build prompt for LLM
      const prompt = buildExtractionPrompt(fieldName, context);

      // 3.5) Call LLM
      const answer = await askLLM(prompt);

      results[fieldName] = answer || null;
    }

    return res.json({
      success: true,
      data: results,
    });
  } catch (err) {
    console.error("❌ Extraction error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};
