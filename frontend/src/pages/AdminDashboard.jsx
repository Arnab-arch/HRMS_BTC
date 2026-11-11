import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";

const defaultSummary = {
  totalEmployees: 0,
  present: 0,
  absent: 0,
  halfDay: 0,
  onLeave: 0,
  totalWorkingMinutes: 0,
  totalWorkingHours: 0,
};

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [dailySummary, setDailySummary] = useState(defaultSummary);
  const [message, setMessage] = useState("Ready to manage employee operations.");
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    department: "",
    job_title: "",
    salary: "",
    status: "active",
  });
  const [workDate, setWorkDate] = useState(new Date().toISOString().slice(0, 10));
  const [selectedAttendanceId, setSelectedAttendanceId] = useState("");
  const [attendanceUpdate, setAttendanceUpdate] = useState({
    status: "present",
    total_working_minutes: "",
  });

  const loadEmployees = async () => {
    const response = await api.get("/api/employees", {
      params: { page: 1, limit: 20 },
    });
    setEmployees(response.data.employees || []);
  };

  const loadAttendance = async () => {
    const response = await api.get("/api/attendance/admin/all", {
      params: { page: 1, limit: 20 },
    });
    setAttendance(response.data.attendance || []);
  };

  const loadDailySummary = async (dateValue) => {
    try {
      const response = await api.get(`/api/attendance/admin/daily/${dateValue}`);
      setDailySummary(response.data.summary || defaultSummary);
    } catch (err) {
      setMessage(err.response?.data?.error || "Unable to load the daily summary.");
    }
  };

  useEffect(() => {
    loadEmployees();
    loadAttendance();
    loadDailySummary(workDate);
  }, []);

  const handleCreateEmployee = async (event) => {
    event.preventDefault();

    try {
      const payload = {
        ...form,
        salary: form.salary === "" ? undefined : Number(form.salary),
      };

      await api.post("/api/employees", payload);
      setMessage("Employee created successfully.");
      setForm({
        first_name: "",
        last_name: "",
        email: "",
        department: "",
        job_title: "",
        salary: "",
        status: "active",
      });
      await loadEmployees();
    } catch (err) {
      setMessage(err.response?.data?.error || "Employee creation failed.");
    }
  };

  const handleDelete = async (employeeId) => {
    try {
      await api.delete(`/api/employees/${employeeId}`);
      setMessage("Employee deleted successfully.");
      await loadEmployees();
    } catch (err) {
      setMessage(err.response?.data?.error || "Employee deletion failed.");
    }
  };

  const handleUpdateAttendance = async (event) => {
    event.preventDefault();

    if (!selectedAttendanceId) {
      setMessage("Select an attendance record to update.");
      return;
    }

    try {
      const payload = {};
      if (attendanceUpdate.status) payload.status = attendanceUpdate.status;
      if (attendanceUpdate.total_working_minutes !== "") {
        payload.total_working_minutes = Number(attendanceUpdate.total_working_minutes);
      }

      await api.patch(`/api/attendance/admin/${selectedAttendanceId}`, payload);
      setMessage("Attendance updated successfully.");
      await loadAttendance();
    } catch (err) {
      setMessage(err.response?.data?.error || "Attendance update failed.");
    }
  };

  const handleDeleteAttendance = async (attendanceId) => {
    try {
      await api.delete(`/api/attendance/admin/${attendanceId}`);
      setMessage("Attendance record deleted.");
      await loadAttendance();
    } catch (err) {
      setMessage(err.response?.data?.error || "Attendance deletion failed.");
    }
  };

  return (
    <div className="dashboard-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">Admin dashboard</p>
          <h2>Welcome, {user?.name || "Administrator"}</h2>
        </div>
        <button className="ghost-button" onClick={logout}>Logout</button>
      </header>

      <div className="alert-box">{message}</div>

      <div className="card-grid stats-grid">
        <div className="stat-card">
          <span>Total employees</span>
          <strong>{employees.length}</strong>
        </div>
        <div className="stat-card">
          <span>Present</span>
          <strong>{dailySummary.present || 0}</strong>
        </div>
        <div className="stat-card">
          <span>Absent</span>
          <strong>{dailySummary.absent || 0}</strong>
        </div>
        <div className="stat-card">
          <span>Hours</span>
          <strong>{Number(dailySummary.totalWorkingHours || 0).toFixed(1)}</strong>
        </div>
      </div>

      <div className="two-column-layout">
        <section className="panel">
          <h3>Add employee</h3>
          <form onSubmit={handleCreateEmployee} className="stack-form compact-form">
            <div className="field-row">
              <input
                placeholder="First name"
                value={form.first_name}
                onChange={(event) => setForm((current) => ({ ...current, first_name: event.target.value }))}
                required
              />
              <input
                placeholder="Last name"
                value={form.last_name}
                onChange={(event) => setForm((current) => ({ ...current, last_name: event.target.value }))}
                required
              />
            </div>
            <div className="field-row">
              <input
                type="email"
                placeholder="Email"
                value={form.email}
                onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                required
              />
              <input
                placeholder="Department"
                value={form.department}
                onChange={(event) => setForm((current) => ({ ...current, department: event.target.value }))}
                required
              />
            </div>
            <div className="field-row">
              <input
                placeholder="Job title"
                value={form.job_title}
                onChange={(event) => setForm((current) => ({ ...current, job_title: event.target.value }))}
                required
              />
              <input
                type="number"
                placeholder="Salary"
                value={form.salary}
                onChange={(event) => setForm((current) => ({ ...current, salary: event.target.value }))}
              />
            </div>
            <div className="field-row">
              <select
                value={form.status}
                onChange={(event) => setForm((current) => ({ ...current, status: event.target.value }))}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="on_leave">On leave</option>
              </select>
              <button type="submit" className="primary-button">Create</button>
            </div>
          </form>
        </section>

        <section className="panel">
          <h3>Daily attendance summary</h3>
          <div className="inline-form">
            <input
              type="date"
              value={workDate}
              onChange={(event) => setWorkDate(event.target.value)}
            />
            <button
              className="primary-button"
              onClick={() => loadDailySummary(workDate)}
            >
              Load
            </button>
          </div>

          <div className="detail-list compact-list">
            <div><span>Employees</span><strong>{dailySummary.totalEmployees || 0}</strong></div>
            <div><span>Present</span><strong>{dailySummary.present || 0}</strong></div>
            <div><span>Absent</span><strong>{dailySummary.absent || 0}</strong></div>
            <div><span>Half day</span><strong>{dailySummary.halfDay || 0}</strong></div>
            <div><span>On leave</span><strong>{dailySummary.onLeave || 0}</strong></div>
            <div><span>Total minutes</span><strong>{dailySummary.totalWorkingMinutes || 0}</strong></div>
          </div>
        </section>
      </div>

      <section className="panel">
        <h3>Employees</h3>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Department</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {employees.length > 0 ? (
                employees.map((employee) => (
                  <tr key={employee.id || employee._id}>
                    <td>{employee.first_name} {employee.last_name}</td>
                    <td>{employee.email}</td>
                    <td>{employee.department}</td>
                    <td>{employee.status}</td>
                    <td>
                      <button className="danger-button small" onClick={() => handleDelete(employee.id || employee._id)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5">No employees found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="panel">
        <h3>Attendance management</h3>
        <form onSubmit={handleUpdateAttendance} className="stack-form compact-form">
          <div className="field-row">
            <input
              placeholder="Attendance ID"
              value={selectedAttendanceId}
              onChange={(event) => setSelectedAttendanceId(event.target.value)}
            />
            <select
              value={attendanceUpdate.status}
              onChange={(event) =>
                setAttendanceUpdate((current) => ({ ...current, status: event.target.value }))
              }
            >
              <option value="present">Present</option>
              <option value="half_day">Half day</option>
              <option value="absent">Absent</option>
              <option value="on_leave">On leave</option>
            </select>
            <input
              type="number"
              placeholder="Minutes"
              value={attendanceUpdate.total_working_minutes}
              onChange={(event) =>
                setAttendanceUpdate((current) => ({
                  ...current,
                  total_working_minutes: event.target.value,
                }))
              }
            />
            <button type="submit" className="primary-button">Update</button>
          </div>
        </form>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Employee</th>
                <th>Work date</th>
                <th>Status</th>
                <th>Minutes</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {attendance.length > 0 ? (
                attendance.map((item) => (
                  <tr key={item._id}>
                    <td>
                      {item.employeeId?.first_name || "Employee"} {item.employeeId?.last_name || ""}
                    </td>
                    <td>{item.work_date}</td>
                    <td>{item.status}</td>
                    <td>{item.total_working_minutes ?? 0}</td>
                    <td>
                      <button className="ghost-button small" onClick={() => setSelectedAttendanceId(item._id)}>
                        Edit
                      </button>
                      <button className="danger-button small" onClick={() => handleDeleteAttendance(item._id)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5">No attendance records available.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
