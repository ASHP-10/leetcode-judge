import Router from "express";
import { submissionController, getSubmissionByIdController } from "../controllers/submissionController.js";

const router = Router();

router.get("/", submissionController);
router.get("/:id", getSubmissionByIdController)
