import { SendMessageCommand } from "@aws-sdk/client-sqs";
import sqsClient from "../config/sqs.js";

export async function sendSubmissionToQueue(submission) {
    const command = new SendMessageCommand(
        {
            QueueUrl: process.env.SQS_QUEUE_URL,
            MessageBody: JSON.stringify(submission)
        }
    )

    const response = await sqsClient.send(command);

    return response;
}