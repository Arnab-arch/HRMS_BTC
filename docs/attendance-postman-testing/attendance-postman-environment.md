# Postman Environment Configuration

Use a Postman Environment with variables matching the current backend implementation.

## 1. Required variables

Recommended variables:

```text
base_url = http://localhost:3000
admin_token =
employee_token =
employee2_token =
employee_id =
employee2_id =
attendance_id =
work_date = 2026-11-11
start_date = 2026-11-01
end_date = 2026-11-30
```

## 2. How to set them

### base_url

Set to the app server:

```text
http://localhost:3000
```

If the server is started with a different port, update it to match `process.env.PORT`.

### Tokens

After login, copy the token from the response JSON:

```json
{
  "token": "<jwt>"
}
```

Then paste it into the relevant variable value in the Postman environment.

Example:

- `admin_token` = JWT returned by admin login
- `employee_token` = JWT returned by employee 1 login
- `employee2_token` = JWT returned by employee 2 login

### employee IDs

Use the real `_id` values from the Employee documents, not the User IDs.

Retrieve them with:

```http
GET {{base_url}}/api/employees?page=1&limit=20
Authorization: Bearer {{admin_token}}
```

Then copy the employee `_id` values into:

- `employee_id`
- `employee2_id`

### attendance_id

Use the real `_id` value from an attendance record, retrieved by either:

- `GET /api/attendance/admin/all`
- `GET /api/attendance/employee`
- `GET /api/attendance/admin/:attendanceId`

## 3. Authorization header format

Use this exact pattern in every protected request:

```http
Authorization: Bearer {{employee_token}}
```

or

```http
Authorization: Bearer {{admin_token}}
```

Do not include the `Bearer` prefix twice.

## 4. Important relationship note

The attendance self-service routes use the authenticated user email to resolve the Employee record.

That means:

- `employee_id` must be the Mongo ObjectId of the Employee document
- the Employee email must match the authenticated User email exactly after lowercasing
- the employee route does not accept a URL `employeeId` parameter

## 5. Example environment setup flow

1. Start the server.
2. Log in as admin.
3. Save `admin_token`.
4. Create user accounts through `/api/auth/register`.
5. Create matching Employee records through `/api/employees` with same emails.
6. Log in as each employee.
7. Save `employee_token` and `employee2_token`.
8. Fetch employee IDs.
9. Save `employee_id` and `employee2_id`.
10. Perform check-in/check-out for employee 1.
11. Save `attendance_id` from the response.

## 6. Example raw values

```text
base_url = http://localhost:3000
admin_token = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
employee_token = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
employee2_token = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
employee_id = 66f0d6c8d2d9a00123456789
employee2_id = 66f0d6c8d2d9a00123456790
attendance_id = 66f0d6c8d2d9a00123456791
work_date = 2026-11-11
start_date = 2026-11-01
end_date = 2026-11-30
```

Use actual values from your MongoDB data, not placeholders.
