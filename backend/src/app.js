import express from "express";
import cors from "cors";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(cors());

import pdfRouter from "./routes/pdf.routes.js";

app.use("/api/pdf", pdfRouter);

export default app;
