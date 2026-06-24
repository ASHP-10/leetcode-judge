# Coding Platform Judge

## Repository Layout

The repository is split into purpose-specific folders to keep the project modular and easy to navigate:

- `frontend/` - Static frontend for the coding platform. Renders problems, the code editor, and submission results.
- `backend/` - Main API server that proxies frontend requests to cloud resources (DynamoDB/SQS). Contains an `.env` file (see "Environment files" below) and the Node.js server code.
- `containerSetup/` - Docker configuration and supporting scripts used to build the judge Docker image that executes user code in isolation.
- `ec2/` - Worker code that runs on EC2 instances. Contains the worker that polls SQS and invokes the judge container, plus `userdata.sh` to bootstrap an EC2 instance.
- `submissions/` - Example submission artifacts (used for local testing).
- `sampleCodes/` - Starter code and testcases for sample problems.

## Planned Architecture

The system is designed with the following AWS services and components:

- **Node.js** - Main API server
- **DynamoDB** - NoSQL database for storing problems, submissions, and results
- **Amazon SQS** - Queueing system for asynchronous submission processing
- **Docker** - Container orchestration for isolated code execution and scalability
- **Amazon ECR** - Docker image repository
- **EC2 workers / systemd service** - Worker instances that run the judge worker as a long-running service

### High-Level Flow

```text
Client
   ↓
Node.js API Server
   ↓
Store Submission Metadata
   ↓
Send Message to SQS
   ↓
Worker (EC2 instance or container task)
   ↓
Judge Container
   ↓
Compile & Execute Code
   ↓
Store Result in DynamoDB
```

## Environment Files

Two folders require `.env` files for correct operation. **Do NOT commit secrets to version control**; keep `.env` local or use your secret manager.

### `ec2/.env`

Required for the worker to function:

- `AWS_REGION` (e.g., `ap-south-1`)
- `SQS_URL` - SQS queue URL that the EC2 worker will poll
- `S3_BUCKET` - S3 bucket used to store submissions and testcases
- `CONTAINER_NAME` - ECR image name for the judge container
- `MAX_CONTAINER` - Max concurrent containers the worker should start (tune based on instance compute/memory)

### `backend/.env`

Required for the API server:

- `AWS_REGION` (e.g., `ap-south-1`)
- `SQS_QUEUE_URL_EC2` - URL of the SQS queue used by EC2 workers
- `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` - IAM credentials (or use an IAM instance role in production)

## Quick Start

### 1. Clone and navigate:

```bash
git clone <repo-url>
cd leetcode-judge
```

### 2. Backend (API server):

```bash
cd backend
# Create backend/.env with the required values
npm install
node index.js
```

### 3. EC2 Worker:

```bash
cd ec2
# Create ec2/.env with the required variables
# To run the worker manually (starts polling SQS):
node src/worker.js
```

For EC2 deployment, `ec2/userdata.sh` contains bootstrap steps to install Docker, Node.js, clone the repo, pull the image, install dependencies, and create a systemd service that runs the worker at boot.

### 4. Frontend:

The `frontend` folder contains static pages. Open `frontend/index.html` in a browser or serve with a static server while the backend is running.

### 5. Build the Judge Container (for local testing):

```bash
docker build -t <tag-name> containerSetup/
docker run -v $(pwd)/submissions:/sandbox <tag-name> <language> <time>
```

This mounts the local `submissions` directory for debugging the judge image.

## API Endpoints

### Problems

**Get All Problems**

```http
GET /problem
```

Fetches all available problems from the database. (Problem creation is currently manual and must be inserted directly into the database.)

**Get Problem by ID**

```http
GET /problem/:id
```

Fetches complete details for a specific problem from DynamoDB.

### Submissions

**Create Submission**

```http
POST /submission
```

Creates a new submission and sends it for processing.

**Get Submission Result**

```http
GET /submission/:submissionId
```

Fetches the current status and result of a submission. The endpoint returns the submission record while processing; the frontend polls this endpoint until the status is `SUCCESS` or `FAILED`, then renders the result.

## Submission Flow

1. User submits code from the frontend.
2. Frontend calls the backend API, which stores submission metadata and pushes a message to SQS.
3. The EC2 worker polls SQS, downloads source code and testcases from S3, and invokes the judge Docker container.
4. The judge container compiles and executes the code, then the worker stores results in DynamoDB/S3 and updates the submission status.
5. The frontend polls `GET /submission/:submissionId` until status is `SUCCESS` or `FAILED`, then renders results.

## Database & Storage Configuration

### DynamoDB Schema for Problems

Problems must be manually created in DynamoDB. The `Problems` table should have the following structure:

| Attribute     | Type                   | Description                                                    |
| ------------- | ---------------------- | -------------------------------------------------------------- |
| `problemId`   | Number (Partition Key) | Unique identifier for the problem                              |
| `problemName` | String                 | Name/title of the problem (e.g., "Two Sum")                    |
| `description` | String                 | Detailed problem statement and requirements                    |
| `difficulty`  | String                 | Difficulty level (e.g., "Easy", "Medium", "Hard")              |
| `testCases`   | Map                    | Map of test case IDs to test case metadata (see example below) |

**Example DynamoDB Item:**

This uses low level JSON version of DynamoDB to represent rather than the modern DocumentDB. (Please refer awsdocs for more understanding)

```json
{
  "problemId": {
    "N": "3"
  },
  "description": {
    "S": "Given an integer x, return true if x is a prime number and false otherwise.\n\n"
  },
  "difficulty": {
    "S": "Easy"
  },
  "problemName": {
    "S": "Prime Number"
  },
  "testCases": {
    "M": {
      "3": {
        "BOOL": true
      },
      "12345": {
        "BOOL": false
      },
      "1786583": {
        "BOOL": true
      },
      "54354354453367": {
        "BOOL": true
      }
    }
  }
}
```

### S3 Bucket Structure

All test cases are stored in S3. The expected structure is:

```
s3://<bucket-name>/
└── [problemId]/
   ├── input1.txt
   ├── input2.txt
   ├── ...
   ├── output1.txt
   ├── output2.txt
   └── ...

```

**Key Notes:**

- The example for the test cases are available in the `containerSetup/submissions/` directory.
- The `Main.cpp` or `Main.java` are not to be inserted into the S3, they are automatically inserted in the local docker directory.
- Test case files (`input1.txt`, `output1.txt`) follow a simple format: The input test case number matching its output.

## Deployment Notes

- **Local testing**: Use the Quick Start section above.
- **EC2 deployment**: Include `ec2/userdata.sh` as the EC2 instance user data. It will automatically bootstrap the instance and start the worker service.
- **Secrets management**: Keep `.env` files out of Git; add them to `.gitignore`. In AWS deployments, prefer IAM instance roles for EC2 and ECS tasks instead of embedding long-lived credentials.
- **Production security**: Restrict SQS, S3, and ECR access with least-privilege IAM policies.
- **Database setup**: Create a `Problems` table in DynamoDB with `problemId` as the partition key (number type). Manually insert problems using the schema described in "Database & Storage Configuration". Add another table named `Submissions`.

---

README.md and `/frontend` generated with assistance from GPT-4.
