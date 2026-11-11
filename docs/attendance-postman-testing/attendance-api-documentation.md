# Attendance API Documentation (Actual implementation)

This document reflects the code in the current HRMS_BTC backend, not a generic HRMS design. It is based on the actual implemented routes, controllers, services, repositories, middleware, and models.

## 1. Base URL

The server starts in `src/server.js` and mounts attendance routes at:

- `http://localhost:3000/api/attendance`

The server listens on `PORT` from `process.env.PORT` or defaults to `5001`.

## 2. Actual authentication flow

Authentication is implemented in:

- `src/middleware/auth.middleware.js`
- `src/utils/jwt.js`
- `src/services/auth.service.js`
- `src/repositories/user.repository.js`

### JWT behavior

The JWT payload uses:

```js
{
  sub: String(user._id ?? user.id);
}
```

It is created by:

```js
jwt.sign({ sub: String(user._id ?? user.id) }, env.JWT_SECRET, {
  expiresIn: env.JWT_EXPIRES_IN,
});
```

The middleware requires the header:

```http
Authorization: Bearer <token>
```

If the token is missing, invalid, expired, or the user was deleted, the API responds with:

```json
{ "error": "Unauthorized" }
```

### Admin check

`requireAdmin` allows only users whose `req.user.role === "admin"`.

Otherwise it returns:

```json
{ "error": "Admin privileges are required" }
```

### User-to-Employee mapping

There is no direct `user_id` / `employee_id` relationship in the current schema. The attendance self-service logic resolves the employee by matching the authenticated user email to the Employee email:

```js
return Employee.findOne({ email: normalizedEmail }).lean();
```

This means:

- public user registration and employee creation are not automatically linked
- the user must have a matching Employee email to use self-service attendance routes
- without a matching employee record, check-in/check-out or self-view routes may return 403

## 3. Attendance model summary

Actual schema:

- `employeeId`: required ObjectId ref `Employee`
- `work_date`: required string (e.g. `YYYY-MM-DD`)
- `check_in`: Date, default `null`
- `check_out`: Date, default `null`
- `total_working_minutes`: Number, default `0`, min `0`
- `status`: enum `["present", "absent", "half_day", "on_leave"]`, default `"present"`
- unique index: `{ employeeId, work_date }`

This enforces one attendance document per employee per day.

## 4. Attendance routes actually implemented

### Employee routes

1. POST `/api/attendance/check-in`
2. POST `/api/attendance/check-out`
3. GET `/api/attendance/employee`
4. GET `/api/attendance/employee/date-range`
5. GET `/api/attendance/summary`

### Admin routes

6. GET `/api/attendance/admin/all`
7. GET `/api/attendance/admin/daily/:work_date`
8. GET `/api/attendance/admin/summary/:work_date`
9. GET `/api/attendance/admin/employee/:employeeId`
10. GET `/api/attendance/admin/employee/:employeeId/summary`
11. GET `/api/attendance/admin/:attendanceId`
12. PATCH `/api/attendance/admin/:attendanceId`
13. DELETE `/api/attendance/admin/:attendanceId`

### Missing / not implemented

The following are not implemented in the actual code and should not be created in Postman requests:

- `/api/attendance/check-in/:employeeId`
- `/api/attendance/check-out/:employeeId`
- `/api/attendance/employee/:employeeId`
- `/api/attendance/summary/:employeeId`
- `/api/attendance/daily/:work_date`
- `/api/attendance/admin/daily` without a `:work_date`

There is no dedicated `src/validators/attendance.validator.js` in the project.

## 5. Endpoint reference

### 5.1 Employee check-in

- Request name: Check in for authenticated employee
- Method: `POST`
- URL: `/api/attendance/check-in`
- Auth: required
- Role: any authenticated user; the employee is resolved from `req.user.email` to an `Employee` record
- Body: none
- Expected success: `201 Created`
- Actual controller: `checkIn`

Success response shape:

```json
{
  "attendance": {
    "_id": "66f0d6c8d2d9a00123456789",
    "employeeId": "66f0d6c8d2d9a00123456789",
    "work_date": "2026-11-11",
    "check_in": "2026-11-11T09:00:00.000Z",
    "check_out": null,
    "total_working_minutes": 0,
    "status": "present",
    "created_at": "2026-11-11T09:00:00.000Z",
    "updated_at": "2026-11-11T09:00:00.000Z"
  }
}
```

Possible errors:

- `401` Unauthorized: missing or invalid JWT
- `403` Employee profile not found for this user: authenticated user has no matching Employee email
- `409` Attendance already exists for this employee on this date
- `500` unexpected server error

Business rules:

- backend generates the check-in timestamp
- one attendance document per employee per day
- status is set to `present` by default
- no request body is accepted

### 5.2 Employee check-out

- Request name: Check out for authenticated employee
- Method: `POST`
- URL: `/api/attendance/check-out`
- Auth: required
- Role: any authenticated user with matching Employee email
- Body: none
- Success status: `200 OK`
- Actual controller: `checkOut`

Success response shape:

```json
{
  "attendance": {
    "_id": "66f0d6c8d2d9a00123456789",
    "employeeId": "66f0d6c8d2d9a00123456789",
    "work_date": "2026-11-11",
    "check_in": "2026-11-11T09:00:00.000Z",
    "check_out": "2026-11-11T18:00:00.000Z",
    "total_working_minutes": 540,
    "status": "present",
    "created_at": "2026-11-11T09:00:00.000Z",
    "updated_at": "2026-11-11T18:00:00.000Z"
  }
}
```

Possible errors:

- `401` Unauthorized
- `403` Employee profile not found for this user
- `404` Attendance not found for today
- `409` Attendance already checked out for today
- `400` Attendance is missing check-in time

Business rules:

- no checkout without check-in
- one checkout per day
- backend calculates `total_working_minutes` as difference in minutes between check_in and check_out
- if minutes are under 240, status becomes `half_day`, else stays `present`

### 5.3 View own attendance

- Request name: Get employee attendance list
- Method: `GET`
- URL: `/api/attendance/employee`
- Auth: required
- Role: any authenticated user with matching Employee email
- Query params:
  - `page` (optional, default 1)
  - `limit` (optional, default 10)
- Success status: `200 OK`

Success response shape:

```json
{
  "attendance": [
    {
      "_id": "66f0d6c8d2d9a00123456789",
      "employeeId": "66f0d6c8d2d9a00123456789",
      "work_date": "2026-11-11",
      "check_in": "2026-11-11T09:00:00.000Z",
      "check_out": "2026-11-11T18:00:00.000Z",
      "total_working_minutes": 540,
      "status": "present"
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 10,
  "totalPages": 1
}
```

Possible errors:

- `401` Unauthorized
- `403` Employee profile not found for this user

### 5.4 View attendance by date range

- Request name: Get own attendance by date range
- Method: `GET`
- URL: `/api/attendance/employee/date-range`
- Auth: required
- Role: any authenticated user with matching Employee email
- Query params:
  - `start_date` required
  - `end_date` required
- Success status: `200 OK`

Success response shape:

```json
{
  "attendance": [
    {
      "_id": "66f0d6c8d2d9a00123456789",
      "employeeId": "66f0d6c8d2d9a00123456789",
      "work_date": "2026-11-11",
      "check_in": "2026-11-11T09:00:00.000Z",
      "check_out": "2026-11-11T18:00:00.000Z",
      "total_working_minutes": 540,
      "status": "present"
    }
  ]
}
```

Possible errors:

- `400` when either `start_date` or `end_date` is missing
- `401` Unauthorized
- `403` Employee profile not found for this user

### 5.5 View own attendance summary

- Request name: Get employee attendance summary
- Method: `GET`
- URL: `/api/attendance/summary`
- Auth: required
- Role: any authenticated user with matching Employee email
- Query params:
  - `start_date` required
  - `end_date` required
- Success status: `200 OK`

Success response shape:

```json
{
  "summary": {
    "totalDays": 5,
    "PresentDays": 4,
    "absentDays": 1,
    "halfDays": 0,
    "leaveDays": 0,
    "totalWorkingMinutes": 2700,
    "totalWorkingHours": 45,
    "totalWrokingHours": 45
  }
}
```

Important note: the repository uses a typo in the aggregate field name (`totalWrokingHours`) and also emits `totalWorkingHours`. This is an implementation detail to be aware of when validating responses.

Possible errors:

- `400` if start_date or end_date missing
- `401` Unauthorized
- `403` Employee profile not found for this user

## 6. Admin attendance endpoints

### 6.1 View all attendance records

- Request name: Admin list all attendance
- Method: `GET`
- URL: `/api/attendance/admin/all`
- Auth: required
- Role: admin only
- Query params:
  - `employee_id` optional
  - `status` optional
  - `start_date` optional
  - `end_date` optional
  - `page` optional, default 1
  - `limit` optional, default 10
- Success status: `200 OK`

Success shape:

```json
{
  "attendance": [
    {
      "_id": "66f0d6c8d2d9a00123456789",
      "employeeId": {
        "_id": "66f0d6c8d2d9a00123456789",
        "first_name": "Alice",
        "last_name": "Johnson",
        "status": "active",
        "email": "alice@example.com",
        "department": "Engineering"
      },
      "work_date": "2026-11-11",
      "check_in": "2026-11-11T09:00:00.000Z",
      "check_out": "2026-11-11T18:00:00.000Z",
      "total_working_minutes": 540,
      "status": "present"
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 10,
  "totalPages": 1
}
```

Possible errors:

- `401` Unauthorized
- `403` Admin privileges are required

### 6.2 View attendance for a particular employee

- Method: `GET`
- URL: `/api/attendance/admin/employee/:employeeId`
- Auth: required
- Role: admin only
- Path parameter: `employeeId` (Mongo ObjectId)
- Query params: `page` and `limit`
- Success status: `200 OK`

### 6.3 View attendance summary for a particular employee

- Method: `GET`
- URL: `/api/attendance/admin/employee/:employeeId/summary`
- Auth: required
- Role: admin only
- Path param: `employeeId`
- Query params: `start_date`, `end_date`
- Success status: `200 OK`

### 6.4 View attendance by date

- Method: `GET`
- URL: `/api/attendance/admin/daily/:work_date`
- Auth: required
- Role: admin only
- Path param: `work_date` in `YYYY-MM-DD` format
- Success status: `200 OK`

Success shape:

```json
{
  "summary": {
    "totalEmployees": 10,
    "present": 8,
    "absent": 1,
    "halfDay": 1,
    "onLeave": 0,
    "totalWorkingMinutes": 5400
  }
}
```

### 6.5 View daily summary by date

- Method: `GET`
- URL: `/api/attendance/admin/summary/:work_date`
- Auth: required
- Role: admin only
- Same logic as above; same controller is used
- Success status: `200 OK`

### 6.6 View individual attendance record

- Method: `GET`
- URL: `/api/attendance/admin/:attendanceId`
- Auth: required
- Role: admin only
- Path param: `attendanceId` (Mongo ObjectId)
- Success status: `200 OK`

Success shape:

```json
{
  "attendance": {
    "_id": "66f0d6c8d2d9a00123456789",
    "employeeId": "66f0d6c8d2d9a00123456789",
    "work_date": "2026-11-11",
    "check_in": "2026-11-11T09:00:00.000Z",
    "check_out": "2026-11-11T18:00:00.000Z",
    "total_working_minutes": 540,
    "status": "present"
  }
}
```

Possible errors:

- `401` Unauthorized
- `403` Admin privileges are required
- `404` Attendance not found

### 6.7 Manually update attendance

- Method: `PATCH`
- URL: `/api/attendance/admin/:attendanceId`
- Auth: required
- Role: admin only
- Path param: `attendanceId`
- Body: any subset of:
  - `check_in`
  - `check_out`
  - `total_working_minutes`
  - `status`

Allowed status values from the model: `present`, `absent`, `half_day`, `on_leave`

Success status: `200 OK`

Example request body:

```json
{
  "check_out": "2026-11-11T18:30:00.000Z",
  "total_working_minutes": 570,
  "status": "present"
}
```

Response shape:

```json
{
  "attendance": {
    "_id": "66f0d6c8d2d9a00123456789",
    "employeeId": "66f0d6c8d2d9a00123456789",
    "work_date": "2026-11-11",
    "check_in": "2026-11-11T09:00:00.000Z",
    "check_out": "2026-11-11T18:30:00.000Z",
    "total_working_minutes": 570,
    "status": "present"
  }
}
```

Possible errors:

- `401` Unauthorized
- `403` Admin privileges are required
- `404` Attendance not found
- `500` if the request body contains no approved field: `No Valid Attendance field provided`
- Mongoose validation errors may also bubble up depending on the payload

### 6.8 Delete attendance

- Method: `DELETE`
- URL: `/api/attendance/admin/:attendanceId`
- Auth: required
- Role: admin only
- Path param: `attendanceId`
- Success status: `200 OK`

Response shape:

```json
{
  "attendance": {
    "_id": "66f0d6c8d2d9a00123456789",
    "employeeId": "66f0d6c8d2d9a00123456789",
    "work_date": "2026-11-11",
    "check_in": "2026-11-11T09:00:00.000Z",
    "check_out": "2026-11-11T18:00:00.000Z",
    "total_working_minutes": 540,
    "status": "present"
  }
}
```

## 7. Validation and business rules in actual code

There is no dedicated attendance validator file.

The current attendance routes do not validate body or query params using Zod or any other explicit validator.

### business rules enforced in service/repository layer

- one attendance document per employee per day
- check-in creates one record only if no record exists for that employee + date
- checkout requires a record to exist for that date
- duplicate checkout throws `409`
- `check_in` and `check_out` are generated by backend timestamps in the service layer
- `total_working_minutes` is calculated as minutes difference between timestamps
- status is set to `half_day` when under 240 minutes else `present`
- record update only accepts these fields:
  - `check_in`
  - `check_out`
  - `total_working_minutes`
  - `status`

## 8. Auth and employee setup for attendance testing

The app supports:

- `POST /api/auth/register` for normal users
- `POST /api/auth/login` for either normal user or admin
- `POST /api/auth/create-admin` for admin creation as an admin user

### Normal user creation

```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "Employee One",
  "email": "employee1@example.com",
  "password": "long-enough-password"
}
```

### Admin creation

The app has a bootstrap admin script in `src/script/create-admin.js` and a check script in `src/script/check-admin.js`.

Required environment variables:

```env
BOOTSTRAP_ADMIN_NAME=Admin
BOOTSTRAP_ADMIN_EMAIL=admin@example.com
BOOTSTRAP_ADMIN_PASSWORD=YourStrongPassword123
JWT_SECRET=replace_with_secure_secret
JWT_EXPIRES_IN=1d
MONGOODB_URL=mongodb://localhost:27017/employee_management
```

Then run:

```bash
npm run create-admin
```

This creates a User document with role `admin` if one does not already exist.

### Needed employee records for attendance self-service

Because the attendance logic resolves the employee using email matching, you must create employee records with the same email as the authenticated users used for attendance testing.

Example:

- User email: `employee1@example.com`
- Employee email: `employee1@example.com`

This is a must for self-service attendance routes to succeed.

The employee creation route is admin-only in `src/routes/employee.routes.js`:

```http
POST /api/employees/
Authorization: Bearer <admin_token>
```

Body example:

```json
{
  "first_name": "Employee",
  "last_name": "One",
  "email": "employee1@example.com",
  "department": "Engineering",
  "job_title": "Developer",
  "salary": 50000,
  "status": "active"
}
```

Use the same email exactly as the user account. The app lowercases employee emails and user emails before comparison.

## 9. Known implementation issues to expect in manual testing

- No attendance validator file exists
- No validation is enforced on attendance request bodies or query params
- The `getAdminDailySummary` and `getAdminSummary` routes both point at the same controller and will both work
- `findAttendanceByDateRange` does not validate `start_date` and `end_date`
- There is a typo in summary output (`totalWrokingHours`)
- `resolveEmployeeForUser()` uses the user email match, which is the current identity workaround but not a real foreign key relationship
- Admin routes are protected correctly, but employee self-service routes rely on a matching employee email, not on a user ID relationship

## 10. Summary of the actual Attendance API

This project implements a moderate employee attendance system with:

- employee self-service check-in/check-out
- employee self-service attendance listing and summaries
- admin-only attendance management and daily summary views
- a unique one-record-per-day rule per employee
- MongoDB-backed attendance storage

There are 13 implemented attendance endpoints, all under `/api/attendance`.

## 11. Important testing note

When testing attendance manually in Postman:

1. create or login a user
2. create a matching employee record with the same email
3. use that user's token for self-service attendance routes
4. use admin token for `/api/attendance/admin/*` routes
5. use `status` values from the actual model: `present`, `absent`, `half_day`, `on_leave`
