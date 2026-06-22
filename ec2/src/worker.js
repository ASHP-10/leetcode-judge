import "dotenv/config";
import { recieveMessage, deleteMessage } from "./sqs.js";
import containerSpinUp from "./container.js";
import { downloadTestCases } from "./s3.js";

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

    await Promise.all(messages.map(async (msg) => {
        try {
            const message = JSON.parse(msg.Body);
            console.log("Processing submission:", message.submissionId);
            await downloadTestCases(`${message.problemId}/`, message.submissionId);
            await containerSpinUp(message);
            console.log("Finished submission:", message.submissionId);
        } catch (err) {
            console.log("Error processing message:", err);
        } finally {
            try {
                const res = await deleteMessage(queueUrl, msg.ReceiptHandle);
                console.log("Deleted message:", res);
            } catch (delErr) {
                console.log("Failed to delete message:", delErr);
            }
        }
    }));

}

startWorker();