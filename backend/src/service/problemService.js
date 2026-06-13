import docClient from '../config/dynamodb.js';

import { ScanCommand, GetCommand } from '@aws-sdk/lib-dynamodb';



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

export async function getProblemById(id) {
    const response = await docClient.send(
        new GetCommand({
            TableName: 'Problem',
            Key: {
                problemId: Number(id)
            }
        })
    )

    return response.Item;
}

export default { getProblemById, getProblems };
