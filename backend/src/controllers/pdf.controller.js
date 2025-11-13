import fs from "fs";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";
import File from "../models/file.model.js";

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
    const fileBuffer = fs.readFileSync(filePath);

    // 1) Extract text from PDF
    const { text, numpages } = await extractTextFromPDF(filePath);
    console.log("Extracted text length:", text.length);
    console.log("Pages:", numpages);

    // const fullText = data && data.text ? data.text.replace(/\r/g, "") : "";

    // 2) chunk text
    const chunks = chunkText(text, 3000); // adjust size as needed

    // 3) save file meta to MongoDB (optional but recommended)
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

    // 4) delete temp file
    fs.unlink(filePath, (err) => {
      if (err) console.warn("Failed to delete temp PDF:", err.message);
    });

    // 5) return response (for testing, return first 3 chunks)
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
