import { Router } from "express";
import { extractFields } from "../controllers/extract.controller.js";
import upload from "../middlewares/upload.js";

const extractRouter = Router();

extractRouter.route("/").post(upload.single(), extractFields);

export default extractRouter;
