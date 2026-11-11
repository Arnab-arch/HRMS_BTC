import { Router } from "express";
import * as attendanceController from "../controllers/attendance.controller.js";
import { Authmiddleware, requireAdmin } from "../middleware/auth.middleware.js";

const router = Router();

router.use(Authmiddleware);

router.post("/check-in", attendanceController.checkIn);
router.post("/check-out", attendanceController.checkOut);
router.get("/employee", attendanceController.getEmployeeAttendance);
router.get("/employee/date-range", attendanceController.getEmployeeAttendanceByDateRange);
router.get("/summary", attendanceController.getEmployeeSummary);

router.get("/admin/all", requireAdmin, attendanceController.getAllAttendance);
router.get("/admin/daily/:work_date", requireAdmin, attendanceController.getAdminDailySummary);
router.get("/admin/summary/:work_date", requireAdmin, attendanceController.getAdminDailySummary);
router.get(
  "/admin/employee/:employeeId",
  requireAdmin,
  attendanceController.getAdminEmployeeAttendance,
);
router.get(
  "/admin/employee/:employeeId/summary",
  requireAdmin,
  attendanceController.getAdminEmployeeSummary,
);
router.get("/admin/:attendanceId", requireAdmin, attendanceController.getAdminAttendanceById);
router.patch("/admin/:attendanceId", requireAdmin, attendanceController.updateAttendance);
router.delete("/admin/:attendanceId", requireAdmin, attendanceController.deleteAttendance);

export default router;
