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

    for (_ in messages) {
        console.log(_.MessageId);
    }

    if (messages === undefined) {
        console.log("Empty message");
    } else {
        const message = JSON.parse(messages[0].Body);

        console.log(message);

        try {
            await downloadTestCases(message.problemId + "/", message.submissionId);
            await containerSpinUp(message);
        } finally {
            console.log(await deleteMessage(queueUrl, messages[0].ReceiptHandle));
        }
    }

}

startWorker();