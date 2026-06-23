import { DynamoDBClient } from "@aws-sdk/client-dynamodb"
import { DynamoDBDocumentClient, UpdateCommand } from "@aws-sdk/lib-dynamodb";


const client = new DynamoDBClient({
    region: process.env.AWS_REGION
});

const docClient = DynamoDBDocumentClient.from(client);

export async function updateSubmissionStatus(submissionId, status, error = null, output = null) {
    console.log(status, output, error);
    let command;

    switch (status) {
        case "SUCCESS":
            command = new UpdateCommand({
                TableName: "Submissions",
                Key: {
                    submissionId
                },

                UpdateExpression:
                    "SET #status = :status",

                ExpressionAttributeNames: {
                    "#status": "status",
                },

                ExpressionAttributeValues: {
                    ":status": status,
                }
            });
            break;

        case "FAILED":
            command = new UpdateCommand({
                TableName: "Submissions",
                Key: {
                    submissionId
                },

                UpdateExpression:
                    "SET #status = :status, #output = :output, #error = :error",

                ExpressionAttributeNames: {
                    "#status": "status",
                    "#output": "output",
                    "#error": "error"
                },

                ExpressionAttributeValues: {
                    ":status": status,
                    ":output": output,
                    ":error": error
                }
            });
            break;

        default: console.log("Unidentified status");
    }


    const response = await docClient.send(command);
    console.log(response);

    if (response.$metadata.httpStatusCode != 200) {
        console.log("Error in updating")
        console.log(response);
    } else {
        console.log(submissionId + " updated");
    }
}