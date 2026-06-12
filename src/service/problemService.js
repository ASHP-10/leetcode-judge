import client from '../config/dynamodb.js';

import { DynamoDBDocumentClient, ScanCommand } from '@aws-sdk/lib-dynamodb';

const docClient = DynamoDBDocumentClient.from(client);

export async function getProblems() {

    const response = await docClient.send(
        new ScanCommand({
            TableName: process.env.PROBLEM_TABLE || 'Problem',
        })
    );

    return response.Items;
}

export default {
    getProblems
};
