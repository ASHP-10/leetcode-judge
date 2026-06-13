import { sendSubmissionToQueue } from "../service/sqsService.js";
import { createSubmissionId } from "../service/submissionService.js"

export async function submissionController(req, res, next) {
    console.log("Got request");
    try {
        //const submissionId = await createSubmissionId(req);

        const submissionId = 1;
        if (!submissionId) {
            return res.status(500).json({
                message: "submissionId not generated"
            });
        }

        const response = await sendSubmissionToQueue(submissionId);

        if (response.$metadata.httpStatusCode != 200) {
            console.log("Not Pushed to Queue")
            console.log(response);
        }

        console.log(res)
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