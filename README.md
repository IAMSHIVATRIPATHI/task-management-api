# Task Management API - SDE Intern (Backend) Assessment

This project is a submission for the SDE Intern (Backend) technical assessment. It is a comprehensive Task Management API built with Nest.js, TypeORM, and PostgreSQL, designed to meet all the specified requirements.

## Overview

The API provides a robust backend solution for managing tasks, with features including:

- **User Authentication**: Secure user registration and login using JWTs (JSON Web Tokens).
- **CRUD Operations**: Full support for Creating, Reading, Updating, and Deleting tasks.
- **Data Persistence**: Interaction with a PostgreSQL database managed via TypeORM.
- **Validation & Error Handling**: Implementation of input validation and proper error handling.
- **Testing**: Includes both unit and end-to-end (E2E) tests to ensure reliability.

## Prerequisites

- [Node.js](https://nodejs.org/) (v16 or later recommended)
- [Docker](https://www.docker.com/) & Docker Compose

## Getting Started

To set up and run this project locally, please follow these steps.

### 1. Installation

First, clone the repository (if you haven't already) and install the required dependencies.

```bash
npm install
```

### 2. Environment Configuration

The project requires a `.env` file for environment-specific variables. An example file is provided.

**Create the `.env` file:**

```bash
cp .env.example .env
```

The default values in `.env.example` are configured to work with the provided Docker setup. You will need to add a `JWT_SECRET` for the application to run.

### 3. Database Setup

The PostgreSQL database runs in a Docker container. To start it, run the following command:

```bash
# If you encounter permission issues, you may need to use 'sudo'
docker-compose up -d
```

This will start a PostgreSQL instance on port `5432` and create the `task_db` database.

### 4. Running the Application

Once the database is running, you can start the Nest.js server in development mode:

```bash
npm run start:dev
```

The server will be accessible at `http://localhost:3000`.

## Exploring the API

### Swagger Documentation

The API includes Swagger documentation for easy exploration and testing of endpoints. Once the server is running, you can access it at:

**[http://localhost:3000/api](http://localhost:3000/api)**

### Workflow for Testing Endpoints

1. **Register a User**: `POST /auth/signup`
2. **Log In**: `POST /auth/signin` to receive an `accessToken`.
3. **Authorize**: In the Swagger UI, click the "Authorize" button and enter `Bearer <your_token>`.
4. **Interact with Tasks**: You can now make authenticated requests to the `/tasks` endpoints.

## Running Tests

### Unit Tests

```bash
npm run test
```

### End-to-End (E2E) Tests

```bash
npm run test:e2e
```

### Test Summary

The following table summarizes the end-to-end tests, all of which passed successfully, confirming the API's core functionality.

| Test Suite          | Test Case                                          | Status |
| ------------------- | -------------------------------------------------- | :----: |
| AppController (e2e) | `✓ / (GET)`                                        | Passed |
| Auth                | `✓ /auth/signup (POST) - success`                  | Passed |
| Auth                | `✓ /auth/signup (POST) - duplicate user`           | Passed |
| Auth                | `✓ /auth/signin (POST) - success`                  | Passed |
| Auth                | `✓ /auth/signin (POST) - fail`                     | Passed |
| Tasks               | `✓ should allow CRUD operations for authenticated user` | Passed |
| Tasks               | `✓ should fail for unauthenticated user`           | Passed |

Thank you for the opportunity to submit this assessment. I look forward to your feedback.

