import Router from "express";
import { submissionController, getSubmissionByIdController } from "../controllers/submissionController.js";

const router = Router();

router.post("/", submissionController);
router.get("/:id", getSubmissionByIdController)

export default router;