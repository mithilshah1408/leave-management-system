import MainLayout from "../../layout/MainLayout";
import { useEffect, useState } from "react";
import api from "../../services/api";
import "./TeamLeaveHistoryPage.css";

function TeamLeaveHistoryPage() {
  const [leaveHistory, setLeaveHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => { fetchLeaveHistory(); }, []);

  const fetchLeaveHistory = async () => {
    setError("");
    try {
      const res = await api.get("/leave-requests/team-history");
      setLeaveHistory((Array.isArray(res.data) ? res.data : []).filter(l => l.status !== "CANCELLED"));
    } catch (err) {
      setError("Failed to load team leave history. Please refresh.");
      console.error("Error fetching leave history:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
      <MainLayout>
        <div className="team-history-page">
          <h2>Team Leave History</h2>
          <p>View leave activity of employees reporting to you.</p>

          {error && <p className="error-banner">{error}</p>}

          {loading ? <p>Loading leave history...</p> : (
              <div className="table-wrapper">
                <table className="history-table">
                  <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Leave Type</th>
                    <th>Start Date</th>
                    <th>End Date</th>
                    <th>Days</th>
                    <th>Status</th>
                    <th>Employee Reason</th>
                    <th>Manager Remarks</th>
                  </tr>
                  </thead>
                  <tbody>
                  {leaveHistory.length === 0 ? (
                      <tr><td colSpan="8" style={{ textAlign:"center", color:"#6b7280", padding:"20px" }}>No leave history found</td></tr>
                  ) : (
                      leaveHistory.map(leave => (
                          <tr key={leave.id}>
                            <td style={{ fontWeight:500 }}>{leave.employeeName}</td>
                            <td>{leave.leaveType}</td>
                            <td>{leave.startDate}</td>
                            <td>{leave.endDate}</td>
                            <td style={{ textAlign:"center" }}>{leave.numberOfDays}</td>
                            <td><span className={`status ${leave.status?.toLowerCase()}`}>{leave.status}</span></td>
                            <td className="reason-cell">
                              {leave.reason
                                  ? <span className="reason-text">{leave.reason}</span>
                                  : <span style={{ color:"#9ca3af", fontStyle:"italic" }}>—</span>
                              }
                            </td>
                            <td className="reason-cell">
                              {leave.managerRemark
                                  ? <span className="manager-remark-text">{leave.managerRemark}</span>
                                  : <span style={{ color:"#9ca3af", fontStyle:"italic" }}>—</span>
                              }
                            </td>
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

export default TeamLeaveHistoryPage;
