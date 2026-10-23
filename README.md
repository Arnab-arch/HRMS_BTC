# HRMS_BTC — Employee Management API

A secure REST API for managing employee records and user accounts, built with **Node.js, Express.js, PostgreSQL, JWT, and Zod**.

The project focuses on backend development fundamentals, including REST API design, authentication, role-based authorization, database operations, request validation, error handling, and automated testing.

## Features

### 1. Authentication and User Management
- User registration and login.
- Password hashing using `bcryptjs`.
- JWT-based authentication.
- Separate roles for `admin` and `user`.
- Public registration does not allow users to assign themselves an admin role.
- Admin account creation supports role validation.
- Protected routes require valid authentication.

### 2. Employee Management
- Create employee records.
- Retrieve employee details by ID.
- Retrieve the employee list.
- Update employee information.
- Delete employee records.
- Prevent duplicate employee emails through database constraints.
- Support employee statuses: `active`, `inactive`, and `on_leave`.

### 3. Search, Filtering, and Pagination
- Search employees by supported text fields.
- Filter employees by department and status.
- Combine search and filters.
- Paginate employee results using page and limit parameters.
- Return pagination metadata, including total records and total pages.

### 4. Validation and Error Handling
- Request validation using Zod schemas.
- Email normalization.
- Validation of employee IDs, pagination parameters, and employee fields.
- Rejection of invalid fields and unsupported roles.
- Appropriate error responses for invalid requests.
- Protection against SQL injection through parameterized SQL queries and an allowlist for dynamic update fields.

### 5. Database
- PostgreSQL database integration using the `pg` package.
- Separate database connection configuration.
- Parameterized database queries.
- Database constraints for required fields, unique emails, valid roles, and employee salary and status.
- Automatic creation and update timestamps where configured.

### 6. Automated Tests
The project uses Node.js's built-in test runner and `assert/strict`.

Current validation tests cover:

- User registration and login schemas.
- Admin account schema validation.
- Email normalization.
- Employee creation validation.
- Employee ID validation.
- Search, filtering, and pagination input validation.
- Rejection of empty employee updates.
- Rejection of unsupported update fields.

Run the tests with:

```bash
npm test
```

## Tech Stack

| Technology | Purpose |
|---|---|
| Node.js | JavaScript runtime |
| Express.js | REST API framework |
| PostgreSQL | Relational database |
| `pg` | PostgreSQL client |
| JWT (`jsonwebtoken`) | Token-based authentication |
| `bcryptjs` | Password hashing |
| Zod | Request validation |
| dotenv | Environment variable management |
| Nodemon | Development server auto-restart |
| Node.js Test Runner | Automated testing |

## Project Structure

```text
HRMS_BTC/
├── src/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   ├── middleware/
│   ├── repositories/
│   ├── routes/
│   ├── script/
│   │   └── create-admin.js
│   ├── services/
│   ├── utils/
│   ├── validators/
│   ├── app.js
│   └── server.js
├── test/
├── .env
├── .env.example
├── .gitignore
└── package.json
```

*The structure represents the current intended organization; update it if your actual files differ.*

## Getting Started

### Prerequisites

Install the following before running the project:

- Node.js and npm
- PostgreSQL
- Git
- Postman (recommended for API testing)

### 1. Clone the Repository

```bash
git clone https://github.com/Arnab-arch/HRMS_BTC.git
cd HRMS_BTC
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the project root:

```env
PORT=3000

DB_HOST=localhost
DB_PORT=5432
DB_NAME=employee_management
DB_USER=employee_app
DB_PASSWORD=your_database_password

JWT_SECRET=your_long_random_secret
JWT_EXPIRES_IN=1d

BOOTSTRAP_ADMIN_NAME=Admin
BOOTSTRAP_ADMIN_EMAIL=admin@example.com
BOOTSTRAP_ADMIN_PASSWORD=your_secure_password
```

Replace the example values with your local configuration. Use the actual variable names expected by your implementation.

**Security:** Never commit `.env` or real credentials to GitHub. Keep `.env` in `.gitignore` and commit only a sanitized `.env.example`.

### 4. Set Up the Database

Create the PostgreSQL database and application role, then execute the SQL schema for the `users` and `employees` tables.

Ensure the application role has the required schema, table, and sequence privileges.

The schema should enforce constraints such as:

- Unique user and employee email addresses.
- Valid user roles (`admin`, `user`).
- Valid employee statuses.
- Non-negative employee salaries.

### 5. Create an Admin Account

If your project uses the bootstrap admin script, configure the admin environment variables and run:

```bash
npm run create-admin
```

Use this command only in an appropriately configured environment. Admin creation should not be exposed as an unrestricted public operation.

### 6. Start the Server

Development mode:

```bash
npm run dev
```

Production-style start:

```bash
npm start
```

The local base URL is:

```text
http://localhost:3000
```

Check the configured port and actual route prefixes in your project.

## API Endpoints

The following table describes the intended API routes. Confirm the exact paths against your route files.

### Authentication

| Method | Endpoint | Purpose | Access |
|---|---|---|---|
| POST | `/api/auth/register` | Register a user | Public |
| POST | `/api/auth/login` | Authenticate a user | Public |
| POST | Admin account creation route | Create a user with a specified role | Admin only |

### Employees

| Method | Endpoint | Purpose | Access |
|---|---|---|---|
| POST | `/api/employees` | Create an employee | Admin |
| GET | `/api/employees` | List employees | Authenticated |
| GET | `/api/employees/:id` | Get employee details | Authenticated |
| PATCH | `/api/employees/:id` | Update employee details | Admin |
| DELETE | `/api/employees/:id` | Delete an employee | Admin |

Protected endpoints require a valid JWT in the request header:

```http
Authorization: Bearer YOUR_JWT_TOKEN
```

## Example Requests

### Register a User

`POST /api/auth/register`

```json
{
  "name": "Test User",
  "email": "testuser@example.com",
  "password": "TestPassword123!"
}
```

### Create an Employee

`POST /api/employees`

```json
{
  "first_name": "Ada",
  "last_name": "Lovelace",
  "email": "ada.lovelace@example.com",
  "department": "Engineering",
  "job_title": "Software Engineer",
  "salary": 75000,
  "status": "active"
}
```

This request requires an administrator's JWT.

### Search and Filter Employees

```http
GET /api/employees?search=Ada
GET /api/employees?department=Engineering
GET /api/employees?status=active
GET /api/employees?search=Ada&department=Engineering&status=active
GET /api/employees?page=1&limit=5
```

### Update an Employee

`PATCH /api/employees/1`

```json
{
  "department": "Research",
  "salary": 85000
}
```

Only supported fields should be accepted for updates.

## Testing with Postman

Recommended testing workflow:

1. Register a normal user.
2. Log in and obtain a JWT.
3. Log in with the administrator account and obtain an admin JWT.
4. Create an employee using the admin token.
5. Retrieve employee records and test search, filters, and pagination.
6. Update and delete employee records using the admin token.
7. Test invalid input, duplicate emails, invalid IDs, and unsupported fields.
8. Verify that unauthenticated requests and unauthorized role access are rejected.

Expected behavior depends on the implementation, but typical responses are:

- `200 OK` — successful retrieval or update.
- `201 Created` — successful creation.
- `400 Bad Request` — invalid request data.
- `401 Unauthorized` — missing or invalid authentication.
- `403 Forbidden` — authenticated user lacks the required permissions.
- `404 Not Found` — requested resource does not exist.
- `409 Conflict` — duplicate resource, if handled explicitly.

## Current Development Status

- [x] Express application and PostgreSQL connection setup
- [x] User authentication and password hashing
- [x] JWT authentication
- [x] Admin/user role separation
- [x] Zod validation schemas
- [x] Employee CRUD repository operations
- [x] Employee search, filtering, and pagination logic
- [x] Automated schema validation tests
- [x] Invalid request validation and error handling
- [x] Postman testing workflow established

## Future Improvements

Potential next steps include:

- Integration tests for API endpoints.
- More comprehensive automated tests for authentication and authorization.
- Centralized error-handling middleware.
- API documentation using Swagger/OpenAPI.
- Structured logging and request monitoring.
- Database migrations and repeatable seed scripts.
- CI workflows for automated testing.
- Deployment configuration and production security hardening.

## Learning Objectives

This project provides practical experience with:

- REST API architecture.
- Express request lifecycle and middleware.
- Authentication versus authorization.
- JWT and password security.
- PostgreSQL queries and database constraints.
- Input validation with Zod.
- Dynamic SQL updates and parameterized queries.
- Search, filtering, and pagination.
- Unit testing and API testing.

## Author

**Arnab Sheoran**

GitHub: [Arnab-arch](https://github.com/Arnab-arch)

---

*HRMS_BTC is an ongoing backend development project. Features and documentation will evolve as implementation and testing progress.*
