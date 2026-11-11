import Employee from "../models/employee.model.js";
import * as Attendancerespository from "../repositories/attendance.repositories.js";

function createError(message, statusCode) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function formatTodayDate(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function isvalidDatework(work_date) {
  if (typeof work_date !== "string") {
    return false;
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(work_date)) {
    return false;
  }

  const date = new Date(`${work_date}T00:00:00.000Z`);

  return (
    !Number.isNaN(date.getTime()) &&
    date.toISOString().slice(0, 10) === work_date
  );
}

export async function resolveEmployeeForUser(user) {
  if (!user || typeof user.email !== "string") {
    return null;
  }

  const normalizedEmail = user.email.trim().toLowerCase();
  if (!normalizedEmail) {
    return null;
  }

  return Employee.findOne({ email: normalizedEmail }).lean();
}

export async function ensureEmployeeAccess(user, employeeId) {
  if (!user) {
    throw createError("Unauthorized", 401);
  }

  if (user.role === "admin") {
    return String(employeeId);
  }

  const employee = await resolveEmployeeForUser(user);
  if (!employee) {
    throw createError("Employee profile not found for this user", 403);
  }

  const resolvedEmployeeId = String(employee._id);
  if (String(employeeId) !== resolvedEmployeeId) {
    throw createError("Forbidden", 403);
  }

  return resolvedEmployeeId;
}

export async function createAttendance(employeeId) {
  const work_date = formatTodayDate();
  const existingAttendance =
    await Attendancerespository.findAttendanceByEmployeeAndDate(
      employeeId,
      work_date,
    );

  if (existingAttendance) {
    throw createError(
      "Attendance already exists for this employee on this date",
      409,
    );
  }

  try {
    return Attendancerespository.createAttendance({
      employeeId,
      work_date,
      check_in: new Date(),
      check_out: null,
      total_working_minutes: 0,
      status: "present",
    });
  } catch (error) {
    if (error.code === 11000) {
      throw createError("You have already checked in today", 409);
    }
    throw error;
  }
}

export async function check_out_attendance(employeeId, checkOut = new Date()) {
  const work_date = formatTodayDate();
  const attendance =
    await Attendancerespository.findAttendanceByEmployeeAndDate(
      employeeId,
      work_date,
    );

  if (!attendance) {
    throw createError("Attendance not found for today", 404);
  }

  if (attendance.check_out) {
    throw createError("Attendance already checked out for today", 409);
  }

  if (!attendance.check_in) {
    throw createError("Attendance is missing check-in time", 400);
  }

  const checkInDate = new Date(attendance.check_in);
  const checkOutDate = new Date(checkOut);
  const diffMs = checkOutDate.getTime() - checkInDate.getTime();
  const totalMinutes = Math.max(0, Math.floor(diffMs / 60000));

  await Attendancerespository.updateCheckOut(
    attendance._id,
    checkOutDate,
    totalMinutes,
  );

  const nextStatus = totalMinutes < 240 ? "half_day" : "present";
  return Attendancerespository.updateAttendance(attendance._id, {
    status: nextStatus,
  });
}

export async function getAttendanceByEmployee(employeeId, page, limit) {
  return Attendancerespository.findAttendanceByEmployee(
    employeeId,
    page,
    limit,
  );
}

export async function getAttendanceByDateRange(employeeId, start_date, end_date) {
  return Attendancerespository.findAttendanceByDateRange(
    employeeId,
    start_date,
    end_date,
  );
}

export async function getAttendanceSummary(employeeId, startDate, endDate) {
  return Attendancerespository.getEmployeattendanceSummary(
    employeeId,
    startDate,
    endDate,
  );
}

export async function getDailySummary(workDate) {
  return Attendancerespository.getDailyAttendanceSummary(workDate);
}

export async function getAllAttendance(filters = {}) {
  return Attendancerespository.findAllattendance(filters);
}

export async function getAttendanceById(attendanceId) {
  return Attendancerespository.findAttendanceById(attendanceId);
}

export async function updateAttendance(attendanceId, updateData) {
  return Attendancerespository.updateAttendance(attendanceId, updateData);
}

export async function deleteAttendance(attendanceId) {
  return Attendancerespository.deleteAttendance(attendanceId);
}

export { isvalidDatework, formatTodayDate };
