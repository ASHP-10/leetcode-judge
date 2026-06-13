import { SendMessageCommand } from "@aws-sdk/client-sqs";
import sqsClient from "../config/sqs.js";

export async function sendSubmissionToQueue(request, submissionId) {
    const command = new SendMessageCommand(
        {
            QueueUrl: process.env.SQS_QUEUE_URL,
            MessageBody: JSON.stringify({ ...request.body, submissionId })
        }
    )

    const response = await sqsClient.send(command);

    return response;
}