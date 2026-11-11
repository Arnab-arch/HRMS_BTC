# Attendance Postman Test Plan

This plan is based on the actual backend implementation in this repository. It matches the implemented routes, authentication flow, and business rules, and intentionally avoids endpoints that do not exist.

## 1. Environment prerequisites

Before starting the test sequence:

- MongoDB is running and reachable by `MONGOODB_URL`
- the server is running from the project root
- at least one admin user exists
- at least two normal user accounts exist
- at least two employee records exist with matching emails to those users

## 2. Test data required

Use real, unique credentials for testing, for example:

- Admin user: `admin.attendance@example.com`
- Employee 1 user: `employee1.attendance@example.com`
- Employee 2 user: `employee2.attendance@example.com`

Create matching Employee records with same emails:

- Employee 1 email = `employee1.attendance@example.com`
- Employee 2 email = `employee2.attendance@example.com`

## 3. Phase 1: Server and authentication

### Test 1: server health

Request:

```http
GET {{base_url}}/
```

Expected:

- `200 OK`
- response body: `EMPLOYEE_MANAGEMENT_API`

### Test 2: register normal user 1

```http
POST {{base_url}}/api/auth/register
Content-Type: application/json

{
  "name": "Employee One",
  "email": "employee1.attendance@example.com",
  "password": "long-enough-password"
}
```

Expected:

- `201 Created`
- body contains a `user` object and `message: "User registered successfully"`

### Test 3: register normal user 2

```http
POST {{base_url}}/api/auth/register
Content-Type: application/json

{
  "name": "Employee Two",
  "email": "employee2.attendance@example.com",
  "password": "long-enough-password"
}
```

Expected:

- `201 Created`

### Test 4: login employee 1

```http
POST {{base_url}}/api/auth/login
Content-Type: application/json

{
  "email": "employee1.attendance@example.com",
  "password": "long-enough-password"
}
```

Expected:

- `200 OK`
- response includes `token`, `user`, and `message: "Login successful"`
- save `token` into `employee_token`

### Test 5: login employee 2

Same pattern for `employee2.attendance@example.com`.

Expected:

- `200 OK`
- save into `employee2_token`

### Test 6: login admin

```http
POST {{base_url}}/api/auth/login
Content-Type: application/json

{
  "email": "admin.attendance@example.com",
  "password": "YourStrongPassword123"
}
```

Expected:

- `200 OK`
- response includes admin token
- save into `admin_token`

### Test 7: unauthorized request without token

```http
POST {{base_url}}/api/attendance/check-in
```

Expected:

- `401 Unauthorized`
- response body: `{ "error": "Unauthorized" }`

### Test 8: authenticated user profile

```http
GET {{base_url}}/api/auth/current-user
Authorization: Bearer {{employee_token}}
```

Expected:

- `200 OK`
- same user returned with `id`, `name`, `email`, and `role`

## 4. Phase 2: Employee check-in

### Test 9: employee 1 check-in succeeds

```http
POST {{base_url}}/api/attendance/check-in
Authorization: Bearer {{employee_token}}
```

Expected:

- `201 Created`
- body contains `attendance`
- `attendance.check_in` is set by backend
- `attendance.total_working_minutes` is `0`
- `attendance.status` is `"present"`

### Test 10: employee 1 duplicate check-in is rejected

Repeat the same request with same employee token.

Expected:

- `409 Conflict`
- message: `Attendance already exists for this employee on this date`

### Test 11: employee 2 cannot check in on employee 1 behalf

This route does not accept an employeeId parameter, so the only way to attempt this is by leaving the token for employee 2 and verifying the self-service logic denies if the email does not match. In the current implementation, the route uses the currently authenticated user only.

Expected:

- not possible by URL tampering, because the route does not accept `employeeId`
- if there is no matching Employee record for the current user, it returns `403`

### Test 12: verify attendance document created

```http
GET {{base_url}}/api/attendance/employee
Authorization: Bearer {{employee_token}}
```

Expected:

- `200 OK`
- includes one attendance document for today
- `total` is at least 1

## 5. Phase 3: Employee check-out

### Test 13: employee 1 checkout succeeds

```http
POST {{base_url}}/api/attendance/check-out
Authorization: Bearer {{employee_token}}
```

Expected:

- `200 OK`
- attendance document updated
- `check_out` set by backend
- `total_working_minutes` > 0
- `status` may be `present` or `half_day` depending on elapsed time

### Test 14: duplicate checkout is rejected

Repeat the same request.

Expected:

- `409 Conflict`
- body contains `Attendance already checked out for today`

### Test 15: checkout without previous check-in is rejected

Use a fresh user with no attendance record for today.

Expected:

- `404 Not Found`
- response: `Attendance not found for today`

### Test 16: employee 2 cannot check out employee 1 attendance

Not possible via path tampering, because the route resolves from the authenticated user.

Expected:

- `403 Employee profile not found for this user` if there is no matching employee record

## 6. Phase 4: Employee attendance viewing

### Test 17: view own attendance list

```http
GET {{base_url}}/api/attendance/employee?page=1&limit=10
Authorization: Bearer {{employee_token}}
```

Expected:

- `200 OK`
- `attendance` array
- pagination metadata

### Test 18: view own attendance by date range

```http
GET {{base_url}}/api/attendance/employee/date-range?start_date=2026-11-01&end_date=2026-11-30
Authorization: Bearer {{employee_token}}
```

Expected:

- `200 OK`
- array returned in `attendance`

### Test 19: view own attendance summary

```http
GET {{base_url}}/api/attendance/summary?start_date=2026-11-01&end_date=2026-11-30
Authorization: Bearer {{employee_token}}
```

Expected:

- `200 OK`
- body contains `summary`

### Test 20: employee attempts to access another employee's data

This is not possible through current routes because self-service endpoints derive identity from the authenticated user.

Expected:

- the route cannot be passed another employee ID via URL
- a user without a matching Employee record gets `403`

## 7. Phase 5: Admin attendance management

### Test 21: admin views all attendance

```http
GET {{base_url}}/api/attendance/admin/all?page=1&limit=10
Authorization: Bearer {{admin_token}}
```

Expected:

- `200 OK`
- list with pagination fields

### Test 22: admin views attendance for one employee

```http
GET {{base_url}}/api/attendance/admin/employee/{{employee_id}}?page=1&limit=10
Authorization: Bearer {{admin_token}}
```

Expected:

- `200 OK`

### Test 23: admin views employee summary

```http
GET {{base_url}}/api/attendance/admin/employee/{{employee_id}}/summary?start_date=2026-11-01&end_date=2026-11-30
Authorization: Bearer {{admin_token}}
```

Expected:

- `200 OK`
- body contains `summary`

### Test 24: admin views daily attendance summary

```http
GET {{base_url}}/api/attendance/admin/daily/{{work_date}}
Authorization: Bearer {{admin_token}}
```

Expected:

- `200 OK`
- body contains daily summary values

### Test 25: admin gets one attendance record by ID

```http
GET {{base_url}}/api/attendance/admin/{{attendance_id}}
Authorization: Bearer {{admin_token}}
```

Expected:

- `200 OK`
- body contains `attendance`

### Test 26: admin manually updates attendance

```http
PATCH {{base_url}}/api/attendance/admin/{{attendance_id}}
Authorization: Bearer {{admin_token}}
Content-Type: application/json

{
  "status": "half_day",
  "total_working_minutes": 180
}
```

Expected:

- `200 OK`
- updated record returned

### Test 27: admin deletes attendance

```http
DELETE {{base_url}}/api/attendance/admin/{{attendance_id}}
Authorization: Bearer {{admin_token}}
```

Expected:

- `200 OK`
- deleted record returned

## 8. Phase 6: Negative and validation testing

### Test 28: employee attempts admin route

```http
GET {{base_url}}/api/attendance/admin/all
Authorization: Bearer {{employee_token}}
```

Expected:

- `403 Forbidden`
- response: `{ "error": "Admin privileges are required" }`

### Test 29: invalid ObjectId

```http
GET {{base_url}}/api/attendance/admin/invalid-id
Authorization: Bearer {{admin_token}}
```

Expected:

- `200 OK` or `404` depending on the query path, because the repository checks ObjectId validity in some operations but not all routes
- route may still fall through to a generic value and return data or not found

Note: the current code does not validate `attendanceId` path params for admin routes in the route layer before repository lookup.

### Test 30: missing auth header

```http
POST {{base_url}}/api/attendance/check-in
```

Expected:

- `401 Unauthorized`

### Test 31: invalid token

```http
POST {{base_url}}/api/attendance/check-in
Authorization: Bearer invalid.token.value
```

Expected:

- `401 Unauthorized`

### Test 32: missing `start_date` or `end_date`

```http
GET {{base_url}}/api/attendance/summary
Authorization: Bearer {{employee_token}}
```

Expected:

- `400 Bad Request`
- message: `start_date and end_date are required`

### Test 33: invalid date format

```http
GET {{base_url}}/api/attendance/employee/date-range?start_date=2026/11/01&end_date=2026/11/30
Authorization: Bearer {{employee_token}}
```

Expected:

- no explicit validation by route, so the behavior is determined by MongoDB query semantics
- not a formal global validation failure

### Test 34: invalid attendance update payload

```http
PATCH {{base_url}}/api/attendance/admin/{{attendance_id}}
Authorization: Bearer {{admin_token}}
Content-Type: application/json

{
  "foo": "bar"
}
```

Expected:

- `500 Internal Server Error` because repository throws `No Valid Attendance field provided`

This is a current implementation quirk and should be documented as such.

## 9. Data integrity checks

After running attendance tests, verify:

- there is only one attendance record per employee per date
- `check_in` is populated
- `check_out` is populated after checkout
- `total_working_minutes` is non-negative
- `status` is one of `present`, `absent`, `half_day`, `on_leave`
- employee assignment is based on `employeeId`
- `_id` values are valid ObjectIds
- pagination fields reflect the current data set

## 10. Expected failure points and where to inspect

If a test fails, check the relevant layer:

- route mismatch => `src/routes/attendance.routes.js`
- auth problem => `src/middleware/auth.middleware.js`
- user/employee mapping problem => `src/services/attendance.services.js` and Employee/User models
- business logic problem => `src/services/attendance.services.js`
- query problem => `src/repositories/attendance.repositories.js`
- schema problem => `src/models/attendance.model.js`
- DB issue => MongoDB connection or collection state
- error message issue => `src/middleware/error.middleware.js`

## 11. Important Postman execution notes

- Never hardcode JWTs into the collection or docs
- Always store tokens as environment variables
- Use `{{admin_token}}` and `{{employee_token}}` for matching requests
- Use `{{employee_id}}` and `{{employee2_id}}` only in admin routes where a real employee record is required
- The self-service routes do not accept `employeeId` in the URL
- Employee identity is derived from the signed-in user email and the matching Employee email
