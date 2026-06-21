import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

async function containerSpinUp(message) {
    const body = JSON.parse(message.Body);

    console.log(body);

    const { stdout, stderr } = await execAsync(
        `docker run -v /media/ashwin/3e882e26-4cfd-374b-8db1-599f591e6c00/Dev/leetcode-judge/containerSetup:/sandbox leetcode-judge ${body.submissionId} ${body.language} 5`
    );

    if (stderr) {
        console.error(stderr);
    } else {
        console.log(stdout);
    }
}

export default containerSpinUp;