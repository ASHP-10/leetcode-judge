import { Router } from "express";
import { submissionController, getSubmissionByIdController } from "../controllers/submissionController.js";

const router = Router();

router.post("/", submissionController);
router.get("/:submissionId", getSubmissionByIdController)

export default router;
