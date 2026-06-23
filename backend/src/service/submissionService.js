import { PutCommand } from "@aws-sdk/lib-dynamodb";
import { GetItemCommand } from "@aws-sdk/client-dynamodb";
import docClient from "../config/dynamodb.js";

export async function storeSubmissionRequest(request) {
    const submissionId = crypto.randomUUID();
    console.log("generated successfully" + submissionId);

    try {
        const putCommand = new PutCommand({
            TableName: "Submissions",
            Item: {
                submissionId: submissionId,
                problemId: request.body.problemId,
                language: request.body.language,
                code: request.body.code,
                status: "PENDING",
                method: request.body.method
            }
        });

        const response = await docClient.send(putCommand);

        if (response.$metadata.httpStatusCode != 200) {
            console.log("Did not insert into DynamoDB");
            console.log(response);
        } else {
            console.log("Inserted into DB");
        }

        return submissionId;
    } catch (error) {
        console.log(error);
    }
}

export async function getSubmissionDetails(submissionId) {

    let command = new GetItemCommand({
        TableName: "Submissions",
        Key: {
            submissionId: { S: submissionId }
        },
        ConsistentRead: true
    })

    const response = await docClient.send(command);
    console.log(response);

    if (response.$metadata.httpStatusCode == 200) {
        console.log("Fetched submission from DB");
    } else {
        console.log(response.$metadata.httpStatusCode + " Error fetching submission from DB");
    }

    return response;
}
