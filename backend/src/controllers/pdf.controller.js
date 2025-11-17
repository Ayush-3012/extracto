import fs from "fs";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";
import File from "../models/file.model.js";
import { embedChunks } from "../utils/embedder.js";
import { upsertChunksToPinecone } from "../utils/upsertToPinecone.js";

// helper: chunk by approx n chars
function chunkText(text, chunkSize = 3000) {
  const chunks = [];
  let i = 0;

  while (i < text.length) {
    let part = text.slice(i, i + chunkSize);

    // try to cut at newline/space near end for cleaner splits
    const lastNewline = part.lastIndexOf("\n");
    const lastSpace = part.lastIndexOf(" ");

    if (lastNewline > chunkSize * 0.6) {
      part = text.slice(i, i + lastNewline);
      i += lastNewline;
    } else if (lastSpace > chunkSize * 0.6) {
      part = text.slice(i, i + lastSpace);
      i += lastSpace;
    } else {
      i += chunkSize;
    }
    chunks.push(part.trim());
  }
  return chunks;
}

// Helper: Extract text from PDF using pdfjs-dist
// ----------------------------------------------------
async function extractTextFromPDF(filePath) {
  const pdfData = new Uint8Array(fs.readFileSync(filePath));

  const loadingTask = pdfjsLib.getDocument({ data: pdfData });
  const pdf = await loadingTask.promise;

  let fullText = "";

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();

    const pageText = textContent.items.map((item) => item.str).join(" ");
    fullText += pageText + "\n\n";
  }

  return {
    text: fullText,
    numpages: pdf.numPages,
  };
}

export const uploadPdf = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const filePath = req.file.path;

    // 1) Extract text from PDF
    const { text, numpages } = await extractTextFromPDF(filePath);
    console.log("Extracted text length:", text.length);
    console.log("Pages:", numpages);

    // 2) chunk text
    const chunks = chunkText(text, 3000); // adjust size as needed

    // 3) save file meta to MongoDB
    let savedFile;
    try {
      savedFile = await File.create({
        originalName: req.file.originalname,
        fileName: req.file.filename,
        carrier: req.body.carrier || null,
        product: req.body.product || null,
        processedAt: new Date(),
        pageCount: numpages,
      });
    } catch (err) {
      console.warn("Mongo save failed:", err.message);
    }

    // 4) Generate embeddings for chunks
    console.log("⏳ Generating embeddings...");
    const embeddings = await embedChunks(chunks);
    console.log("✅ Embeddings generated:", embeddings.length);

    // 5) Upsert into Pinecone
    if (savedFile) {
      console.log("⏳ Uploading vectors to Pinecone...");
      await upsertChunksToPinecone({
        fileId: savedFile._id.toString(),
        chunks,
        embeddings,
        carrier: req.body.carrier || null,
        product: req.body.product || null,
      });
      console.log("🔥 Vector upsert complete!");
    }

    // 6) delete temp file
    fs.unlink(filePath, (err) => {
      if (err) console.warn("Failed to delete temp PDF:", err.message);
    });

    // 7) return response
    return res.json({
      success: true,
      message: "PDF parsed and chunks created",
      fileId: savedFile ? savedFile._id : null,
      pageCount: numpages,
      chunksCount: chunks.length,
      previewChunks: chunks.slice(0, 3),
    });
  } catch (err) {
    console.error("Upload error:", err);
    return res
      .status(500)
      .json({ message: "Something went wrong", error: err.message });
  }
};
