import { sendSubmissionToQueue } from "../service/sqsService.js";
import { createSubmissionId } from "../service/submissionService.js"

export async function submissionController(req, res, next) {
    try {
        const submissionId = await createSubmissionId(req);

        if (submissionId != Number()) {
            res.send("submissionId not generated");
        }

        const response = await sendSubmissionToQueue(submissionId);

        console.log(response);

        res.json(submissionId);
    } catch (error) {
        next(error);
    }
}

export async function getSubmissionByIdController(req, res, next) {
    try {

    } catch (error) {
        next(error);
    }
}