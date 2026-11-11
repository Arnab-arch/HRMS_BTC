import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";

const DEFAULT_SUMMARY = {
  totalDays: 0,
  PresentDays: 0,
  absentDays: 0,
  halfDays: 0,
  leaveDays: 0,
  totalWorkingMinutes: 0,
  totalWorkingHours: 0,
};

export default function EmployeeDashboard() {
  const { user, logout } = useAuth();
  const [attendance, setAttendance] = useState([]);
  const [summary, setSummary] = useState(DEFAULT_SUMMARY);
  const [statusMessage, setStatusMessage] = useState("");
  const [dateRange, setDateRange] = useState({
    start_date: "",
    end_date: "",
  });

  const loadOwnAttendance = async (params = {}) => {
    try {
      const endpoint = params.start_date && params.end_date
        ? "/api/attendance/employee/date-range"
        : "/api/attendance/employee";

      const response = await api.get(endpoint, {
        params: params.start_date && params.end_date
          ? { start_date: params.start_date, end_date: params.end_date }
          : { page: 1, limit: 10 },
      });

      setAttendance(
        endpoint.endsWith("date-range")
          ? response.data.attendance || []
          : response.data.attendance || response.data?.items || [],
      );
    } catch (err) {
      setStatusMessage(err.response?.data?.error || "Unable to load your attendance.");
    }
  };

  const loadSummary = async (startDate, endDate) => {
    try {
      const response = await api.get("/api/attendance/summary", {
        params: { start_date: startDate, end_date: endDate },
      });
      setSummary(response.data.summary || DEFAULT_SUMMARY);
    } catch (err) {
      setSummary(DEFAULT_SUMMARY);
      setStatusMessage(err.response?.data?.error || "Unable to load summary.");
    }
  };

  useEffect(() => {
    loadOwnAttendance();
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().slice(0, 10);
    setDateRange({ start_date: start, end_date: end });
    loadSummary(start, end);
  }, []);

  const handleCheckIn = async () => {
    try {
      const response = await api.post("/api/attendance/check-in");
      setStatusMessage("Check-in successful.");
      setAttendance((current) => [response.data.attendance, ...current]);
      const start = dateRange.start_date || "";
      const end = dateRange.end_date || "";
      if (start && end) loadSummary(start, end);
    } catch (err) {
      setStatusMessage(err.response?.data?.error || "Check-in failed.");
    }
  };

  const handleCheckOut = async () => {
    try {
      const response = await api.post("/api/attendance/check-out");
      setStatusMessage("Check-out successful.");
      setAttendance((current) =>
        current.map((item) =>
          item._id === response.data.attendance._id ? response.data.attendance : item,
        ),
      );
      const start = dateRange.start_date || "";
      const end = dateRange.end_date || "";
      if (start && end) loadSummary(start, end);
    } catch (err) {
      setStatusMessage(err.response?.data?.error || "Check-out failed.");
    }
  };

  const handleDateRangeSubmit = async (event) => {
    event.preventDefault();

    if (!dateRange.start_date || !dateRange.end_date) {
      setStatusMessage("Please choose both a start and end date.");
      return;
    }

    await loadOwnAttendance({
      start_date: dateRange.start_date,
      end_date: dateRange.end_date,
    });
    await loadSummary(dateRange.start_date, dateRange.end_date);
  };

  return (
    <div className="dashboard-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">Employee dashboard</p>
          <h2>Welcome, {user?.name || "Employee"}</h2>
        </div>
        <button className="ghost-button" onClick={logout}>Logout</button>
      </header>

      <div className="alert-box">{statusMessage || "Your attendance workspace is ready."}</div>

      <div className="button-row">
        <button className="primary-button" onClick={handleCheckIn}>Check In</button>
        <button className="secondary-button" onClick={handleCheckOut}>Check Out</button>
      </div>

      <div className="card-grid stats-grid">
        <div className="stat-card">
          <span>Total days</span>
          <strong>{summary.totalDays || 0}</strong>
        </div>
        <div className="stat-card">
          <span>Present</span>
          <strong>{summary.PresentDays || 0}</strong>
        </div>
        <div className="stat-card">
          <span>Half day</span>
          <strong>{summary.halfDays || 0}</strong>
        </div>
        <div className="stat-card">
          <span>Hours</span>
          <strong>{Number(summary.totalWorkingHours || 0).toFixed(1)}</strong>
        </div>
      </div>

      <div className="two-column-layout">
        <section className="panel">
          <h3>Attendance range</h3>
          <form onSubmit={handleDateRangeSubmit} className="inline-form">
            <input
              type="date"
              value={dateRange.start_date}
              onChange={(event) =>
                setDateRange((current) => ({ ...current, start_date: event.target.value }))
              }
            />
            <input
              type="date"
              value={dateRange.end_date}
              onChange={(event) =>
                setDateRange((current) => ({ ...current, end_date: event.target.value }))
              }
            />
            <button className="primary-button" type="submit">Apply</button>
          </form>
        </section>

        <section className="panel">
          <h3>My profile</h3>
          <div className="detail-list">
            <div><span>Name</span><strong>{user?.name}</strong></div>
            <div><span>Email</span><strong>{user?.email}</strong></div>
            <div><span>Role</span><strong>{user?.role}</strong></div>
          </div>
        </section>
      </div>

      <section className="panel">
        <h3>Attendance records</h3>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Work date</th>
                <th>Check in</th>
                <th>Check out</th>
                <th>Minutes</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {attendance.length > 0 ? (
                attendance.map((item) => (
                  <tr key={item._id}>
                    <td>{item.work_date}</td>
                    <td>{item.check_in ? new Date(item.check_in).toLocaleString() : "—"}</td>
                    <td>{item.check_out ? new Date(item.check_out).toLocaleString() : "—"}</td>
                    <td>{item.total_working_minutes ?? 0}</td>
                    <td>{item.status || "present"}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5">No attendance records found for this date range.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
