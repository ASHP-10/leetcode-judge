# Coding Platform Judge

## Planned Architecture

The system is designed with the following AWS services and components:

- **Node.js** - Main API server
- **DynamoDB** - NoSQL database for storing problems, submissions, and results
- **Amazon SQS** - Queueing system for asynchronous submission processing
- **Amazon ECS Fargate** - Container orchestration for isolated code executiona and scalability
- **Amazon ECR** - Docker image repository

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
Worker / ECS Task
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
GET /submission/:id
```

Fetches the current status and result of a submission.

---

# Local Judge Development

## Expected Directory Structure

The container expects the following directory structure:

```text
<current-directory>
│
└── <submission-id>
   ├── Main.cpp
   ├── input1.txt
   └── output1.txt
```

Currently supported languages:

- C++
- Java

---

## Step 1: Build the Docker Image

Build the Docker image from the project directory.

```bash
docker build -t <tag-name> .
```

---

## Step 2: Run the Judge Container

Run the container and mount the `<submission-id>` directory into the sandbox environment.

```bash
docker run -v $(pwd):/sandbox <tag-name> <language>
```

### Parameters

| Parameter    | Description                            |
| ------------ | -------------------------------------- |
| `<tag-name>` | Docker image name                      |
| `<language>` | Programming language (`cpp` or `java`) |

---

## Execution Flow

1. Docker starts the judge container.
2. The `<submission-id>` directory is mounted to `/sandbox`.
3. The entrypoint script detects the selected language.
4. The source code is compiled.
5. The program is executed using `input1.txt`, `input2.txt`....
6. Output is written to `solution.txt` and checked with the `output1.txt`` output2.txt`....
7. The Program continues executing all the test cases and stops when the first test case fails.

---

## Output

### Successful Execution

A file named `solution.txt` will be generated inside the `<submission-id>` directory.

```text
<submission-id>
├── Main.cpp
├── input1.txt
├── output1.txt
├── solution.txt
└── solution
```

### Compilation Error

If compilation fails, the container exits and displays the compilation error.

### Runtime Error

If the program crashes or exceeds the execution timeout, the corresponding runtime error is displayed.

---

## Future ECS/Fargate Integration

The local bind-mounted `/sandbox` directory will eventually be replaced with Amazon S3.

### Planned Flow

```text
User Submission
      ↓
Send Submission Message to SQS
      ↓
Launch ECS Fargate Task
      ↓
Judge Downloads:
    - Source Code
    - Test Cases
      ↓
Invokes Conatiner
      ↓
Compile & Execute
      ↓
Store Result in DynamoDB
```

Used GPT 5.3 for generation of the frontend website and creating this README.md file
