import { S3Client, ListObjectsV2Command, GetObjectCommand } from "@aws-sdk/client-s3";
import fs from "fs";
import { pipeline } from "stream/promises";
import path from "path";

const s3Client = new S3Client({
    region: process.env.AWS_REGION
});


async function createFileDirectory(submissionId) {
    fs.promises.mkdir(`../submissions/${submissionId}`, { recursive: true }, (error) => {
        if (error) {
            console.log("Couldn't create directory" + error);
        } else {
            console.log("New Directory created successfully !!");
        }
    })
}

async function listAllFiles(prefix) {
    const command = new ListObjectsV2Command({
        Bucket: process.env.S3_BUCKET,
        Prefix: prefix
    })

    console.log("Listing all Files: ");

    return await s3Client.send(command);
}

export async function downloadTestCases(prefix, submissionId) {
    await createFileDirectory(submissionId)

    console.log("Entering S3");

    const response = await listAllFiles(prefix);
    // console.log(response);
    try {
        for (const object of response.Contents) {
            const key = object.Key;
            console.log(key);
            const fileName = path.basename(key);

            const file = await s3Client.send(
                new GetObjectCommand({
                    Bucket: process.env.S3_BUCKET,
                    Key: key
                })
            );

            // console.log(file);

            await pipeline(
                file.Body,
                fs.createWriteStream(
                    `../submissions/${submissionId}/${fileName}`
                )
            );

        }
        console.log("Test Cases Downloaded");
    } catch (error) {
        console.log(error);
    }
}

