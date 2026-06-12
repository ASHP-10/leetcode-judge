import client from '../config/dynamodb.js';

import { DynamoDBDocumentClient, ScanCommand } from '@aws-sdk/lib-dynamodb';

const docClient = DynamoDBDocumentClient.from(client);

export async function getProblems() {

    const response = await docClient.send(
        new ScanCommand({
            TableName: process.env.PROBLEM_TABLE || 'Problem',
            ProjectionExpression: "problemId, problemName, difficulty"
        })
    );

    response.Items.sort(
        (a, b) => Number(a.problemId) - Number(b.problemId)
    );

    return response.Items;
}

export default getProblems;
