import test from "node:test";
import assert from "node:assert/strict";

import Employee from "../src/models/employee.model.js";
import * as attendanceService from "../src/services/attendance.services.js";

test("self-service attendance access allows only the authenticated employee", async () => {
  const originalFindOne = Employee.findOne;
  Employee.findOne = () => ({
    lean: () => ({
      _id: "507f1f77bcf86cd799439011",
      email: "ada@example.com",
    }),
  });

  try {
    const allowed = await attendanceService.ensureEmployeeAccess(
      { role: "user", email: "ada@example.com" },
      "507f1f77bcf86cd799439011",
    );
    assert.equal(allowed, "507f1f77bcf86cd799439011");

    await assert.rejects(
      () =>
        attendanceService.ensureEmployeeAccess(
          { role: "user", email: "ada@example.com" },
          "507f1f77bcf86cd799439012",
        ),
      (error) => error.statusCode === 403,
    );

    const adminAllowed = await attendanceService.ensureEmployeeAccess(
      { role: "admin" },
      "507f1f77bcf86cd799439012",
    );
    assert.equal(adminAllowed, "507f1f77bcf86cd799439012");
  } finally {
    Employee.findOne = originalFindOne;
  }
});
