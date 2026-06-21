import { SQSClient, ReceiveMessageCommand, DeleteMessageCommand } from "@aws-sdk/client-sqs";


const sqsClient = new SQSClient({
    region: process.env.AWS_REGION
})

export async function recieveMessage(queueUrl) {
    const command = new ReceiveMessageCommand({
        MaxNumberOfMessages: 1,
        MessageAttributeNames: ["All"],
        QueueUrl: queueUrl,
        WaitTimeSeconds: 5,
    });

    console.log("Message Recieved");

    return await sqsClient.send(command);
}

export async function deleteMessage(queueUrl, ReceiptHandle) {
    const command = new DeleteMessageCommand({
        QueueUrl: queueUrl,
        ReceiptHandle: ReceiptHandle
    })

    console.log("Message delete");

    return await sqsClient.send(command);
}

