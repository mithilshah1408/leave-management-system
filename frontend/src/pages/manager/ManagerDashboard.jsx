import MainLayout from "../../layout/MainLayout";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../../services/api";
import "./ManagerDashboard.css";

function ManagerDashboard() {
  const navigate = useNavigate();
  const [pendingRequests, setPendingRequests] = useState([]);
  const [allRequests, setAllRequests] = useState([]);
  const [teamOnLeaveToday, setTeamOnLeaveToday] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setError("");
    try {
      // Fetch pending requests and team history in parallel
      const [pendingRes, historyRes] = await Promise.all([
        api.get("/leave-approvals/pending"),
        api.get("/leave-requests/team-history"),
      ]);

      const pending = Array.isArray(pendingRes.data) ? pendingRes.data : [];
      const all = Array.isArray(historyRes.data) ? historyRes.data : [];

      setPendingRequests(pending);
      setAllRequests(all);

      // Team on leave TODAY: approved leaves that span today
      const today = new Date().toISOString().split("T")[0];
      setTeamOnLeaveToday(
          all.filter(l => l.status === "APPROVED" && l.startDate <= today && l.endDate >= today).length
      );
    } catch (err) {
      setError("Failed to load dashboard data. Please refresh.");
      console.error("Dashboard load error:", err);
    } finally {
      setLoading(false);
    }
  };

  // "This Month" = all requests (any status) whose startDate falls in the current month
  const now = new Date();
  const monthlyRequests = allRequests.filter(l => {
    const d = new Date(l.startDate);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear() && l.status !== "CANCELLED";
  }).length;

  return (
      <MainLayout>
        <div className="manager-dashboard">
          <h2>Manager Dashboard</h2>
          <p>Review and manage your team's leave requests.</p>

          {error && <p className="error-banner">{error}</p>}

          <div className="stats-grid">
            <div className="stat-card stat-pending">
              <h3>Pending Requests</h3>
              <p>{pendingRequests.length}</p>
            </div>
            <div className="stat-card stat-today">
              <h3>Team On Leave Today</h3>
              <p>{teamOnLeaveToday}</p>
            </div>
            <div className="stat-card stat-monthly">
              <h3>This Month Requests</h3>
              <p>{monthlyRequests}</p>
            </div>
          </div>

          <h3 className="section-title">Quick Actions</h3>
          <div className="actions-grid">
            <div className="action-card" onClick={() => navigate("/manager/leave-approvals")}>
              <h4>Review Leave Requests</h4>
              <p>Approve or reject pending leave requests</p>
            </div>
            <div className="action-card" onClick={() => navigate("/manager/team-history")}>
              <h4>Team Leave History</h4>
              <p>View all team leave activity</p>
            </div>
          </div>

          <h3 className="section-title">Recent Pending Requests</h3>
          {loading ? <p>Loading requests...</p> : (
              <div className="table-wrapper">
                <table className="requests-table">
                  <thead>
                  <tr>
                    <th>Employee</th><th>Leave Type</th><th>Dates</th><th>Reason</th><th>Status</th><th>Action</th>
                  </tr>
                  </thead>
                  <tbody>
                  {pendingRequests.length === 0 ? (
                      <tr><td colSpan="6" style={{ textAlign:"center", color:"#6b7280", padding:"20px" }}>No pending requests</td></tr>
                  ) : (
                      pendingRequests.slice(0, 5).map(leave => (
                          <tr key={leave.id}>
                            <td>{leave.employeeName}</td>
                            <td>{leave.leaveTypeName || leave.leaveType}</td>
                            <td style={{ whiteSpace:"nowrap" }}>{leave.startDate} – {leave.endDate}</td>
                            <td className="reason-cell">{leave.reason || <span style={{ color:"#9ca3af" }}>—</span>}</td>
                            <td><span className={`status ${leave.status?.toLowerCase()}`}>{leave.status}</span></td>
                            <td><button className="review-btn" onClick={() => navigate("/manager/leave-approvals")}>Review</button></td>
                          </tr>
                      ))
                  )}
                  </tbody>
                </table>
              </div>
          )}
        </div>
      </MainLayout>
  );
}

export default ManagerDashboard;
