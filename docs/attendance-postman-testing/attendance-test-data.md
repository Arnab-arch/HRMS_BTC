# Attendance Test Data Setup

This document is based on the current implementation in the repository.

## 1. Required users

Create at least these user accounts through the existing auth endpoints:

### Admin user

```json
{
  "name": "System Admin",
  "email": "admin.attendance@example.com",
  "password": "YourStrongPassword123"
}
```

### Employee user 1

```json
{
  "name": "Employee One",
  "email": "employee1.attendance@example.com",
  "password": "long-enough-password"
}
```

### Employee user 2

```json
{
  "name": "Employee Two",
  "email": "employee2.attendance@example.com",
  "password": "long-enough-password"
}
```

## 2. Create admin user

There are two practical ways:

1. Call `POST /api/auth/create-admin` as an authenticated admin user
2. Bootstrap with `npm run create-admin` and environment variables

### Bootstrap admin setup

Set these environment values in the project `.env`:

```env
BOOTSTRAP_ADMIN_NAME=Admin
BOOTSTRAP_ADMIN_EMAIL=admin.attendance@example.com
BOOTSTRAP_ADMIN_PASSWORD=YourStrongPassword123
JWT_SECRET=your_secure_secret
JWT_EXPIRES_IN=1d
MONGOODB_URL=mongodb://localhost:27017/employee_management
```

Then run:

```bash
npm run create-admin
```

## 3. Create matching employee records

Because attendance self-service resolves the current employee by matching the authenticated user email, create employee records with the same emails as the user accounts.

### Employee 1 record

```json
{
  "first_name": "Employee",
  "last_name": "One",
  "email": "employee1.attendance@example.com",
  "department": "Engineering",
  "job_title": "Developer",
  "salary": 50000,
  "status": "active"
}
```

### Employee 2 record

```json
{
  "first_name": "Employee",
  "last_name": "Two",
  "email": "employee2.attendance@example.com",
  "department": "Engineering",
  "job_title": "Developer",
  "salary": 55000,
  "status": "active"
}
```

Create these via the admin-only employee endpoint:

```http
POST {{base_url}}/api/employees
Authorization: Bearer {{admin_token}}
Content-Type: application/json
```

## 4. Data relationship note

The current system does not automatically link a user to an employee. The identity match is done by email:

```js
Employee.findOne({ email: normalizedEmail });
```

This means the exact same email value must exist in both collections for self-service attendance to succeed.

## 5. Attendance values to use

For manual attendance tests, use realistic data like:

- `work_date = 2026-11-11`
- `start_date = 2026-11-01`
- `end_date = 2026-11-30`

## 6. Example test flow

1. Register admin user or run `npm run create-admin`
2. Log in as admin and save `admin_token`
3. Create employee 1 and employee 2 records
4. Register employee 1 user and employee 2 user
5. Log in as each employee and save `employee_token` / `employee2_token`
6. Execute attendance check-in and check-out endpoint tests
7. Retrieve attendance IDs from responses or list endpoints

## 7. Avoid unsupported assumptions

Do not assume:

- User ID equals Employee ID
- URL employee IDs are trusted in self-service routes
- a `user_id` field exists on the Employee model
- attendance endpoints validate body or query payloads automatically

The current implementation requires explicit setup for matching email records before attendance self-service can work.
