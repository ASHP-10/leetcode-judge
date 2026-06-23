import { sendSubmissionToQueue } from "../service/sqsService.js";
import { storeSubmissionRequest, getSubmissionDetails } from "../service/submissionService.js"


export async function submissionController(req, res, next) {
    console.log("Got request");
    // console.log(req);
    try {
        const submissionId = await storeSubmissionRequest(req);
        // const submissionId = 1;
        if (submissionId == null || undefined) {
            return res.status(500).json({
                message: "submissionId not generated"
            });
        }

        const response = await sendSubmissionToQueue(req, submissionId);

        if (response == "Invalid Method") {
            console.log("Invalid Method detected");
        } else if (response.$metadata.httpStatusCode != 200) {
            console.log("Not Pushed to Queue")
            console.log(response);
        } else {
            console.log("Sent Submission ID " + submissionId + " To the QUEUE " + req.params.method);
            res.json(submissionId);
        }

    } catch (error) {
        next(error);
    }
}

export async function getSubmissionByIdController(req, res, next) {
    try {
        const submission = await getSubmissionDetails(req.params.submissionId);
        res.send(submission);
    } catch (error) {
        next(error);
    }
}