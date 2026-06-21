import "dotenv/config";
import { recieveMessage, deleteMessage } from "./sqs.js";
import containerSpinUp from "./container.js";

async function startWorker() {
    console.log("Starting Worker");
    while (true) {
        try {
            await pollSQS(process.env.SQS_URL);
        } catch (error) {
            console.log("worker error\n" + error);
        }
    }
}

async function pollSQS(queueUrl) {
    const response = await recieveMessage(queueUrl);
    const messages = response.Messages;

    console.log(messages);

    let message;

    if (messages === undefined) {
        console.log("Empty message");
    } else {
        message = messages[0];
        try {
            await getTestCases();
            await containerSpinUp(message);
        } finally {
            console.log(await deleteMessage(queueUrl, message.ReceiptHandle));
        }
    }

}

startWorker();

export default startWorker;