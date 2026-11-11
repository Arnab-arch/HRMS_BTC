import mongoose from "mongoose";
import Attendance from "../models/attendance.model.js";

const ALLOWED_FIELD = [
  "check_in",
  "check_out",
  "total_working_minutes",
  "status",
];

export async function createAttendance(data) {
  return Attendance.create(data);
}

export async function findAttendanceById(id) {
  if (!mongoose.isObjectIdOrHexString(id)) {
    return null;
  }

  return Attendance.findById(id).lean();
}

export async function findAttendacnebyId(id) {
  return findAttendanceById(id);
}

export async function findAttendanceByEmployeeAndDate(employeeId, workDate) {
  return Attendance.findOne({
    employeeId,
    work_date: workDate,
  }).lean();
}

export async function findAttendanceByEmployee(
  employeeId,
  page = 1,
  limit = 10,
) {
  const safePage =
    Number.isFinite(Number(page)) && Number(page) > 0 ? Number(page) : 1;
  const safeLimit =
    Number.isFinite(Number(limit)) && Number(limit) > 0 ? Number(limit) : 10;
  const skip = (safePage - 1) * safeLimit;

  const [attendance, total] = await Promise.all([
    Attendance.find({ employeeId })
      .sort({ work_date: -1 })
      .skip(skip)
      .limit(safeLimit)
      .lean(),
    Attendance.countDocuments({ employeeId }),
  ]);

  return {
    attendance,
    total,
    page: safePage,
    limit: safeLimit,
    totalPages: Math.ceil(total / safeLimit) || 0,
  };
}

export async function findAttendanceByDateRange(
  employeeId,
  start_date,
  end_date,
) {
  const result = await Attendance.find({
    employeeId,
    work_date: { $gte: start_date, $lte: end_date },
  })
    .sort({ work_date: -1 })
    .lean();

  return result;
}

export async function findAttendanceByDate(work_date) {
  return Attendance.find({ work_date })
    .populate({
      path: "employeeId",
      select: "first_name last_name email",
    })
    .lean();
}

export async function findAllattendance({
  employee_id,
  status,
  start_date,
  end_date,
  page = 1,
  limit = 10,
} = {}) {
  const safePage =
    Number.isFinite(Number(page)) && Number(page) > 0 ? Number(page) : 1;
  const safeLimit =
    Number.isFinite(Number(limit)) && Number(limit) > 0 ? Number(limit) : 10;
  const skip = (safePage - 1) * safeLimit;

  const filter = {};

  if (employee_id) {
    filter.employeeId = employee_id;
  }

  if (status) {
    filter.status = status;
  }

  if (start_date || end_date) {
    filter.work_date = {};

    if (start_date) {
      filter.work_date.$gte = start_date;
    }

    if (end_date) {
      filter.work_date.$lte = end_date;
    }
  }

  const [attendance, total] = await Promise.all([
    Attendance.find(filter)
      .populate("employeeId", "first_name last_name status email department")
      .sort({ work_date: -1 })
      .skip(skip)
      .limit(safeLimit)
      .lean(),

    Attendance.countDocuments(filter),
  ]);

  return {
    attendance,
    total,
    page: safePage,
    limit: safeLimit,
    totalPages: Math.ceil(total / safeLimit) || 0,
  };
}

export async function updateAttendance(attendanceId, updateData = {}) {
  const updates = {};

  for (const field of ALLOWED_FIELD) {
    if (Object.prototype.hasOwnProperty.call(updateData, field)) {
      updates[field] = updateData[field];
    }
  }

  if (Object.keys(updates).length === 0) {
    throw new Error("No Valid Attendance field provided");
  }

  return Attendance.findByIdAndUpdate(
    attendanceId,
    { $set: updates },
    {
      new: true,
      runValidators: true,
    },
  ).lean();
}

export async function updateCheckIn(attendanceId, check_in) {
  return Attendance.findByIdAndUpdate(
    attendanceId,
    { $set: { check_in } },
    {
      new: true,
      runValidators: true,
    },
  ).lean();
}

export async function updateCheckOut(attendanceId, checkOut, workingMinutes) {
  return Attendance.findByIdAndUpdate(
    attendanceId,
    {
      $set: {
        check_out: checkOut,
        total_working_minutes: workingMinutes,
      },
    },
    {
      new: true,
      runValidators: true,
    },
  ).lean();
}

export async function deleteAttendance(attendanceId) {
  return Attendance.findByIdAndDelete(attendanceId).lean();
}

export async function getEmployeattendanceSummary(
  employeeId,
  start_date,
  end_date,
) {
  const [summary] = await Attendance.aggregate([
    {
      $match: {
        employeeId: new mongoose.Types.ObjectId(employeeId),
        work_date: { $gte: start_date, $lte: end_date },
      },
    },
    {
      $group: {
        _id: null,
        totalDays: { $sum: 1 },
        PresentDays: {
          $sum: {
            $cond: [{ $eq: ["$status", "present"] }, 1, 0],
          },
        },
        absentDays: {
          $sum: {
            $cond: [{ $eq: ["$status", "absent"] }, 1, 0],
          },
        },
        halfDays: {
          $sum: {
            $cond: [{ $eq: ["$status", "half_day"] }, 1, 0],
          },
        },
        leaveDays: {
          $sum: {
            $cond: [{ $eq: ["$status", "on_leave"] }, 1, 0],
          },
        },
        totalWorkingMinutes: {
          $sum: "$total_working_minutes",
        },
      },
    },
    {
      $project: {
        _id: 0,
        totalDays: 1,
        PresentDays: 1,
        absentDays: 1,
        halfDays: 1,
        leaveDays: 1,
        totalWorkingMinutes: 1,
        totalWorkingHours: {
          $divide: ["$totalWorkingMinutes", 60],
        },
        totalWrokingHours: {
          $divide: ["$totalWorkingMinutes", 60],
        },
      },
    },
  ]);

  return (
    summary || {
      totalDays: 0,
      PresentDays: 0,
      leaveDays: 0,
      absentDays: 0,
      halfDays: 0,
      totalWorkingMinutes: 0,
      totalWorkingHours: 0,
      totalWrokingHours: 0,
    }
  );
}

export async function getDailyAttendanceSummary(workDate) {
  const [summary] = await Attendance.aggregate([
    {
      $match: { work_date: workDate },
    },
    {
      $group: {
        _id: null,
        totalEmployees: { $sum: 1 },
        present: {
          $sum: {
            $cond: [{ $eq: ["$status", "present"] }, 1, 0],
          },
        },
        absent: {
          $sum: {
            $cond: [{ $eq: ["$status", "absent"] }, 1, 0],
          },
        },
        halfDay: {
          $sum: {
            $cond: [{ $eq: ["$status", "half_day"] }, 1, 0],
          },
        },
        onLeave: {
          $sum: {
            $cond: [{ $eq: ["$status", "on_leave"] }, 1, 0],
          },
        },
        totalWorkingMinutes: {
          $sum: "$total_working_minutes",
        },
      },
    },
    {
      $project: {
        _id: 0,
        totalEmployees: 1,
        present: 1,
        absent: 1,
        halfDay: 1,
        onLeave: 1,
        totalWorkingMinutes: 1,
        totalWorkingHours: {
          $divide: ["$totalWorkingMinutes", 60],
        },
      },
    },
  ]);

  return (
    summary || {
      totalEmployees: 0,
      present: 0,
      absent: 0,
      halfDay: 0,
      onLeave: 0,
      totalWorkingMinutes: 0,
      totalWorkingHours: 0,
    }
  );
}
