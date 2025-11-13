import { Router } from "express";
import upload from "../middlewares/upload.js";
import { uploadPdf } from "../controllers/pdf.controller.js";

const pdfRouter = Router();

pdfRouter.route("/upload").post(upload.single("file"), uploadPdf);

export default pdfRouter;
