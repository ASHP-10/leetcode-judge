import { exec } from "child_process";
import { promisify } from "util";
import path from "path";

const execAsync = promisify(exec);

async function containerSpinUp(message) {
    console.log("Spinning up Container");

    const sandboxPath = path.resolve(process.cwd(), "../");

    const { stdout, stderr } = await execAsync(
        `docker run -v ${sandboxPath}:/sandbox leetcode-judge ${message.submissionId} ${message.language} 5`
    );

    if (stderr) {
        console.error(stderr + stdout);
    } else {
        console.log(stdout);
    }
}

export default containerSpinUp;