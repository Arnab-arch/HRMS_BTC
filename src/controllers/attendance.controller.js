import * as attendanceService from "../services/attendance.services.js";

function createServiceError(message, statusCode) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

export async function checkIn(req, res, next) {
  try {
    const employee = await attendanceService.resolveEmployeeForUser(req.user);
    if (!employee) {
      throw createServiceError("Employee profile not found for this user", 403);
    }

    const attendance = await attendanceService.createAttendance(
      String(employee._id),
    );
    return res.status(201).json({ attendance });
  } catch (error) {
    return next(error);
  }
}

export async function checkOut(req, res, next) {
  try {
    const employee = await attendanceService.resolveEmployeeForUser(req.user);
    if (!employee) {
      throw createServiceError("Employee profile not found for this user", 403);
    }

    const attendance = await attendanceService.check_out_attendance(
      String(employee._id),
    );
    return res.status(200).json({ attendance });
  } catch (error) {
    return next(error);
  }
}

export async function getEmployeeAttendance(req, res, next) {
  try {
    const employee = await attendanceService.resolveEmployeeForUser(req.user);
    if (!employee) {
      throw createServiceError("Employee profile not found for this user", 403);
    }

    const page = Number(req.query.page ?? 1);
    const limit = Number(req.query.limit ?? 10);
    const result = await attendanceService.getAttendanceByEmployee(
      String(employee._id),
      page,
      limit,
    );
    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
}

export async function getEmployeeAttendanceByDateRange(req, res, next) {
  try {
    const employee = await attendanceService.resolveEmployeeForUser(req.user);
    if (!employee) {
      throw createServiceError("Employee profile not found for this user", 403);
    }

    const { start_date, end_date } = req.query;
    if (!start_date || !end_date) {
      throw createServiceError("start_date and end_date are required", 400);
    }

    const attendance = await attendanceService.getAttendanceByDateRange(
      String(employee._id),
      start_date,
      end_date,
    );
    return res.status(200).json({ attendance });
  } catch (error) {
    return next(error);
  }
}

export async function getEmployeeSummary(req, res, next) {
  try {
    const employee = await attendanceService.resolveEmployeeForUser(req.user);
    if (!employee) {
      throw createServiceError("Employee profile not found for this user", 403);
    }

    const { start_date, end_date } = req.query;
    if (!start_date || !end_date) {
      throw createServiceError("start_date and end_date are required", 400);
    }

    const summary = await attendanceService.getAttendanceSummary(
      String(employee._id),
      start_date,
      end_date,
    );
    return res.status(200).json({ summary });
  } catch (error) {
    return next(error);
  }
}

export async function getAllAttendance(req, res, next) {
  try {
    const allAttendance = await attendanceService.getAllAttendance(req.query);
    return res.status(200).json(allAttendance);
  } catch (error) {
    return next(error);
  }
}

export async function getAdminEmployeeAttendance(req, res, next) {
  try {
    const { employeeId } = req.params;
    const page = Number(req.query.page ?? 1);
    const limit = Number(req.query.limit ?? 10);
    const result = await attendanceService.getAttendanceByEmployee(
      employeeId,
      page,
      limit,
    );
    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
}

export async function getAdminEmployeeSummary(req, res, next) {
  try {
    const { employeeId } = req.params;
    const { start_date, end_date } = req.query;
    if (!start_date || !end_date) {
      throw createServiceError("start_date and end_date are required", 400);
    }
    const summary = await attendanceService.getAttendanceSummary(
      employeeId,
      start_date,
      end_date,
    );
    return res.status(200).json({ summary });
  } catch (error) {
    return next(error);
  }
}

export async function getAdminDailySummary(req, res, next) {
  try {
    const { work_date } = req.params;
    const summary = await attendanceService.getDailySummary(work_date);
    return res.status(200).json({ summary });
  } catch (error) {
    return next(error);
  }
}

export async function getAdminAttendanceById(req, res, next) {
  try {
    const { attendanceId } = req.params;
    const attendance = await attendanceService.getAttendanceById(attendanceId);
    if (!attendance) {
      throw createServiceError("Attendance not found", 404);
    }
    return res.status(200).json({ attendance });
  } catch (error) {
    return next(error);
  }
}

export async function updateAttendance(req, res, next) {
  try {
    const { attendanceId } = req.params;
    const attendance = await attendanceService.updateAttendance(
      attendanceId,
      req.body,
    );
    if (!attendance) {
      throw createServiceError("Attendance not found", 404);
    }
    return res.status(200).json({ attendance });
  } catch (error) {
    return next(error);
  }
}

export async function deleteAttendance(req, res, next) {
  try {
    const { attendanceId } = req.params;
    const attendance = await attendanceService.deleteAttendance(attendanceId);
    if (!attendance) {
      throw createServiceError("Attendance not found", 404);
    }
    return res.status(200).json({ attendance });
  } catch (error) {
    return next(error);
  }
}
