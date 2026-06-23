import { exec } from "child_process";
import { promisify } from "util";
import path from "path";

const execAsync = promisify(exec);

async function containerSpinUp(message) {
    console.log("Spinning up Container");

    const time = 5;
    const sandboxPath = path.resolve(process.cwd(), "../");

    console.log("Running docker command");
    const { stdout, stderr } = await execAsync(
        `docker run -v ${sandboxPath}:/sandbox ${process.env.CONTAINER_NAME} ${message.submissionId} ${message.language} ${time}`
    );

    console.log("Printing Error: " + stderr);
    if (stderr) {
    } else {
        console.log("Printing output: " + stdout);
    }
}

export default containerSpinUp;