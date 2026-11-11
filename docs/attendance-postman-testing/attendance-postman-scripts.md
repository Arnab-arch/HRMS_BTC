# Postman Scripts for Attendance Testing

These scripts are written to match the actual response structures used by this API.

## 1. Save login token

Use this in the Postman Tests tab for the login requests.

```javascript
pm.test("Login returns a token", function () {
  pm.expect(pm.response.code).to.be.oneOf([200, 201]);
  const json = pm.response.json();
  pm.expect(json).to.have.property("token");
  pm.expect(json.token).to.be.a("string");
});

const json = pm.response.json();
if (json && json.token) {
  pm.environment.set("token", json.token);
}
```

For admin login, set:

```javascript
pm.environment.set("admin_token", json.token);
```

For employee login:

```javascript
pm.environment.set("employee_token", json.token);
```

## 2. Save attendance ID after check-in

Use in the check-in request Tests tab:

```javascript
pm.test("Check-in succeeds", function () {
  pm.expect(pm.response.code).to.be.oneOf([200, 201]);
  const json = pm.response.json();
  pm.expect(json).to.have.property("attendance");
  pm.expect(json.attendance).to.have.property("_id");
});

const json = pm.response.json();
if (json && json.attendance && json.attendance._id) {
  pm.environment.set("attendance_id", json.attendance._id);
}
```

## 3. Save employee IDs after listing employees

Use on the admin employee list endpoint:

```javascript
pm.test("Employee list returned", function () {
  pm.expect(pm.response.code).to.equal(200);
  const json = pm.response.json();
  pm.expect(json).to.have.property("employees");
  pm.expect(Array.isArray(json.employees)).to.equal(true);
});

const json = pm.response.json();
if (json && Array.isArray(json.employees) && json.employees.length > 0) {
  pm.environment.set(
    "employee_id",
    json.employees[0].id || json.employees[0]._id,
  );
  if (json.employees.length > 1) {
    pm.environment.set(
      "employee2_id",
      json.employees[1].id || json.employees[1]._id,
    );
  }
}
```

## 4. Verify success status and response shape

```javascript
pm.test("Response structure is correct", function () {
  pm.expect(pm.response.code).to.be.oneOf([200, 201]);
  const json = pm.response.json();
  if (json.attendance) {
    pm.expect(json.attendance).to.have.property("employeeId");
    pm.expect(json.attendance).to.have.property("work_date");
  }
  if (json.summary) {
    pm.expect(json.summary).to.have.property("totalDays");
  }
});
```

## 5. Verify pagination fields

```javascript
pm.test("Pagination metadata present", function () {
  const json = pm.response.json();
  if (json.attendance) {
    pm.expect(json).to.have.property("total");
    pm.expect(json).to.have.property("page");
    pm.expect(json).to.have.property("limit");
    pm.expect(json).to.have.property("totalPages");
  }
});
```

## 6. Verify working minutes are non-negative

```javascript
pm.test("Working minutes are valid", function () {
  const json = pm.response.json();
  if (json.attendance && json.attendance.total_working_minutes !== undefined) {
    pm.expect(Number(json.attendance.total_working_minutes)).to.be.at.least(0);
  }
});
```

## 7. Verify error response shape

```javascript
pm.test("Error response shape is correct", function () {
  pm.expect(pm.response.code).to.be.within(400, 500);
  const json = pm.response.json();
  pm.expect(json).to.have.property("error");
});
```

## 8. Pre-request script for token injection

Use this on protected requests:

```javascript
const isProtected = [
  "check-in",
  "check-out",
  "employee",
  "summary",
  "admin",
].some((value) => pm.request.url.toString().includes(value));

if (isProtected) {
  const token =
    pm.environment.get("employee_token") || pm.environment.get("admin_token");
  if (token) {
    pm.request.headers.upsert({
      key: "Authorization",
      value: "Bearer " + token,
    });
  }
}
```

If the route is admin-only, use `admin_token` explicitly.

## 9. Example route-specific scripts

### Admin login script

```javascript
pm.test("Admin login succeeds", function () {
  pm.expect(pm.response.code).to.equal(200);
  const json = pm.response.json();
  pm.expect(json).to.have.property("token");
  pm.environment.set("admin_token", json.token);
});
```

### Employee login script

```javascript
pm.test("Employee login succeeds", function () {
  pm.expect(pm.response.code).to.equal(200);
  const json = pm.response.json();
  pm.expect(json).to.have.property("token");
  pm.environment.set("employee_token", json.token);
});
```

### Save admin daily summary date

```javascript
const today = new Date();
const yyyy = today.getFullYear();
const mm = String(today.getMonth() + 1).padStart(2, "0");
const dd = String(today.getDate()).padStart(2, "0");
pm.environment.set("work_date", `${yyyy}-${mm}-${dd}`);
```
