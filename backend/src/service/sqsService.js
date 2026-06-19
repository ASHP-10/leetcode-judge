import 'dotenv/config';
import { SendMessageCommand } from "@aws-sdk/client-sqs";
import sqsClient from "../config/sqs.js";

export async function sendSubmissionToQueue(request, submissionId) {
    let sqsUrl;

    switch (request.body.method) {
        case "ec2":
            sqsUrl = process.env.SQS_QUEUE_URL_EC2;
            break;

        default:
            return "Invalid Method";
    }

    const command = new SendMessageCommand(
        {
            QueueUrl: sqsUrl,
            MessageBody: JSON.stringify({ ...request.body, submissionId })
        }
    )

    const response = await sqsClient.send(command);

    return response;
}