# Coding Platform Judge

## Planned Architecture

The system is designed with the following AWS services and components:

- **Node.js** - Main API server
- **DynamoDB** - NoSQL database for storing problems, submissions, and results
- **Amazon SQS** - Queueing system for asynchronous submission processing
- **Amazon ECS Fargate** - Container orchestration for isolated code executiona and scalability
- **Amazon ECR** - Docker image repository
- **EC2 workers / systemd service** - optional worker EC2 instances that run the judge worker as a long-running service
- **Amazon ECR** - Docker image repository

Branches

- This repository will use separate branches for different deployment methods (for example: `fargate` for fargate-based running). Work for other deployment targets will live in their own branches.

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
Worker (EC2 instance running a long-lived worker or a container task)
   ↓
Judge Container
   ↓
Compile & Execute Code
   ↓
Store Result in DynamoDB
```

---

## API Endpoints

### Problems

#### Get All Problems

```http
GET /problem
```

Fetches all available problems from the database.

> Note: Problem creation is currently manual and must be inserted directly into the database.

---

#### Get Problem by ID

```http
GET /problem/:id
```

Fetches complete details for a specific problem.

---

### Submissions

#### Create Submission

```http
POST /submission
```

Creates a new submission and sends it for processing.

---

#### Get Submission Result

```http
GET /submission/:submissionId
```

Fetches the current status and result of a submission. The endpoint returns the submission record (DynamoDB-style `Item`) while processing; the frontend polls this endpoint until `Item.status.S` is `SUCCESS` or `FAILED` and then renders the parsed result.

---

## Cloud Deployment (EC2)

This repository supports running judge workers on EC2 instances. The `ec2` branch contains code and startup configuration for EC2 workers.

Use the included `ec2/userdata.sh` as the reference for instance bootstrap steps. In short, the userdata script performs the following actions on a fresh instance:

- Installs Docker and Node.js
- Clones the repository (sparse-checkout of the `ec2` directory)
- Pulls the judge Docker image from ECR
- Installs Node.js dependencies (`npm install` in the `ec2` folder)
- Writes a `.env` file with required environment variables (SQS_URL, S3_BUCKET, AWS_REGION, CONTAINER_NAME)
- Creates a systemd service (`/etc/systemd/system/judge-worker.service`) that runs `/usr/bin/node /home/ec2-user/leetcode-judge/ec2/src/worker.js` as `ec2-user`
- Enables and starts the `judge-worker` service

If you provision EC2 instances (for example via the AWS console, CloudFormation, or Terraform), include the userdata from `ec2/userdata.sh` so instances automatically start the worker service on boot.

Frontend behavior: the web app navigates to `submission.html?submissionId=<id>` after creating a submission. The submission page repeatedly requests `GET /submission/:submissionId` on the backend (which proxies DynamoDB). While the returned DynamoDB `Item` has `status.S === "PENDING"` the frontend continues polling; when it observes `SUCCESS` or `FAILED` it parses the `Item` attributes and renders the final result.

---

## Local Development (optional)

If you'd like to run the judge locally (single-machine testing), you can still build and run the judge Docker image manually.

### Build the Docker image

```bash
docker build -t <tag-name> <Dockerfile-directory>
```

### Run the Judge Container locally

```bash
docker run -v $(pwd)/submissions:/sandbox <tag-name> <language>
```

This mounts a local `submissions` directory into the container and runs the judge for the selected language. This mode is useful for debugging the judge container itself.

### Planned Flow

```text
User Submission
   ↓
Send Submission Message to SQS
   ↓
Launch Worker (EC2 instance service or container task)
   ↓
Judge Downloads:
    - Source Code
    - Test Cases
   ↓
Invokes Container
   ↓
Compile & Execute
   ↓
Store Result in DynamoDB
```

Used GPT 5.3 for generation of the frontend website and creating this README.md file
