import fs from "fs";
import path from "path";

export function loadTemplate(carrier, product) {
  try {
    if (!carrier || !product) {
      throw new Error("Carrier or product missing");
    }

    const folder = path.join(process.cwd(), "templates", carrier.toLowerCase());

    const filePath = path.join(folder, product.toLowerCase() + ".json");

    if (!fs.existsSync(filePath)) {
      throw new Error(`Template not found: ${filePath}`);
    }

    const jsonData = fs.readFileSync(filePath, "utf8");

    return JSON.parse(jsonData);
  } catch (err) {
    console.error("❌ Template load error:", err.message);
    throw err;
  }
}
