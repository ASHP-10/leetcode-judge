import "dotenv/config";
import { recieveMessage, deleteMessage } from "./sqs.js";
import containerSpinUp from "./container.js";
import { downloadTestCases } from "./s3.js";
import { updateSubmissionStatus } from "./dynamoDB.js";
import fs from "fs";
import { pipeline } from "stream/promises";

async function startWorker() {
    console.log("Starting Worker");
    while (true) {
        try {
            await pollSQS(process.env.SQS_URL);
        } catch (error) {
            console.log("Worker error\n" + error);
        }
    }
}

async function pollSQS(queueUrl) {
    console.log("Polling SQS");
    const response = await recieveMessage(queueUrl);
    const messages = response.Messages;

    if (!messages || messages.length === 0) {
        console.log("Empty message");
        return;
    }

    processMessage(messages);
}

async function loadSourceFile(submissionId, langauge, code) {
    try {
        await pipeline(
            code,
            fs.createWriteStream(
                `../submissions/${submissionId}/Main.${langauge}`
            )
        );
    } catch (err) {
        console.log(err);
    }
}

async function processMessage(messages) {
    await Promise.all(messages.map(async (msg) => {
        let message;
        try {
            message = JSON.parse(msg.Body);
            console.log("Processing submission:", message.submissionId);

            await downloadTestCases(`${message.problemId}/`, message.submissionId);
            await loadSourceFile(message.submissionId, message.language, message.code);
            await containerSpinUp(message);

            await updateSubmissionStatus(message.submissionId, "SUCCESS");
            console.log("Finished submission (SUCCESS):", message.submissionId);
        } catch (err) {
            console.log(err);
            await updateSubmissionStatus(message.submissionId, "FAILED", err.stderr, err.stdout);
            console.log("Finished submission (FAILURE):", message.submissionId);
        } finally {
            try {
                const res = await deleteMessage(process.env.SQS_URL, msg.ReceiptHandle);
                console.log("Deleted message:", res);
            } catch (delErr) {
                console.log("Failed to delete message:", delErr);
            }
        }
    }));

}

startWorker();