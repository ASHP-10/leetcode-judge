import { SQSClient } from "@aws-sdk/client-sqs";
import { SendMessageCommand } from "@aws-sdk/client-sqs";

export async function sendSubmissionToQueue(submission) {
    const command = SendMessageCommand(
        {
            QueueURL: process.env.QueueURL,
            MessageBody: JSON.stringify(submission)
        }
    )

    const response = await SQSClient.send(command);

    return response;
}