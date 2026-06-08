import { useEffect, useState } from "react";
import MainLayout from "../../layout/MainLayout";
import api from "../../services/api";
import "./LeaveHistoryPage.css";

function LeaveHistoryPage() {
  const [leaves, setLeaves]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchLeaves(); }, []);

  const fetchLeaves = async () => {
    try {
      const res = await api.get("/leave-requests/my");
      // Filter out CANCELLED — they clutter history
      setLeaves((res.data || []).filter(l => l.status !== "CANCELLED"));
    } catch (err) {
      console.error("Failed to fetch leave history", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm("Cancel this leave request?")) return;
    try {
      await api.delete(`/leave-requests/${id}`);
      fetchLeaves();
    } catch {
      alert("Failed to cancel leave request.");
    }
  };

  return (
      <MainLayout>
        <div className="lh-page">
          <h2 className="lh-title">My Leave Requests</h2>

          {loading ? (
              <div className="lh-loading"><div className="lh-spinner" /><span>Loading…</span></div>
          ) : leaves.length === 0 ? (
              <p className="lh-empty">You have not submitted any leave requests.</p>
          ) : (
              <div className="table-wrapper">
                <table className="lh-table">
                  <thead>
                  <tr>
                    <th>Leave Type</th>
                    <th>Start Date</th>
                    <th>End Date</th>
                    <th>Days</th>
                    <th>Status</th>
                    <th>Employee Reason</th>
                    <th>Manager Remarks</th>
                    <th>Action</th>
                  </tr>
                  </thead>
                  <tbody>
                  {leaves.map(leave => (
                      <tr key={leave.id}>
                        <td style={{ fontWeight: 500 }}>{leave.leaveType}</td>
                        <td>{leave.startDate}</td>
                        <td>{leave.endDate}</td>
                        <td style={{ textAlign: "center" }}>{leave.numberOfDays}</td>
                        <td>
                          <span className={`lh-status ${leave.status.toLowerCase()}`}>{leave.status}</span>
                        </td>
                        <td className="lh-reason-cell">
                          {leave.reason
                              ? <span className="lh-reason-text">{leave.reason}</span>
                              : <span className="lh-na">—</span>
                          }
                        </td>
                        <td className="lh-reason-cell">
                          {leave.managerRemark
                              ? <span className="lh-remark-text">{leave.managerRemark}</span>
                              : <span className="lh-na">—</span>
                          }
                        </td>
                        <td>
                          {leave.status === "PENDING" && (
                              <button className="lh-cancel-btn" onClick={() => handleCancel(leave.id)}>Cancel</button>
                          )}
                        </td>
                      </tr>
                  ))}
                  </tbody>
                </table>
              </div>
          )}
        </div>
      </MainLayout>
  );
}

export default LeaveHistoryPage;
