# Task Management API

A Task Management API built with Nest.js, TypeORM, and PostgreSQL. This API supports User Authentication (JWT) and Task CRUD operations.

## Prerequisites

- [Node.js](https://nodejs.org/) (v16 or later)
- [Docker](https://www.docker.com/) & Docker Compose

## Installation

1.  **Clone the repository** (if applicable) and navigate to the project directory.

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Environment Configuration**:
    Copy the example environment file to `.env`:
    ```bash
    cp .env.example .env
    ```
    
    The default configuration in `.env` matches the `docker-compose.yml` settings.
    ```
    DB_HOST=localhost
    DB_PORT=5432
    DB_USERNAME=postgres
    DB_PASSWORD=password
    DB_NAME=task_db
    JWT_SECRET=supersecretkey
    ```

## Database Setup

Start the PostgreSQL database using Docker Compose:

```bash
docker-compose up -d
```

This will start a PostgreSQL instance on port `5432`.

## Running the Application

### Development Mode
```bash
npm run start:dev
```

### Production Mode
```bash
npm run build
npm run start:prod
```

The server will start on `http://localhost:3000`.

## API Documentation

Once the server is running, you can access the Swagger API documentation at:

**[http://localhost:3000/api](http://localhost:3000/api)**

You can use the Swagger UI to test endpoints directly.
1.  **Register**: POST `/auth/signup`
2.  **Login**: POST `/auth/signin` -> Copy the `accessToken`
3.  **Authorize**: Click the "Authorize" button in Swagger UI and enter `Bearer <your_token>`
4.  **Tasks**: Now you can access the `/tasks` endpoints.

## Testing

### Unit Tests
```bash
npm run test
```

### End-to-End (E2E) Tests
**Note:** Ensure the database is running (`docker-compose up -d`) before running E2E tests.

```bash
npm run test:e2e
```
