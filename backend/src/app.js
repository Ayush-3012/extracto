import express from "express";
import cors from "cors";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(cors());

import pdfRouter from "./routes/pdf.routes.js";
import extractRouter from "./routes/extract.routes.js";

app.use("/api/pdf", pdfRouter);
app.use("/api/extract", extractRouter);

export default app;
