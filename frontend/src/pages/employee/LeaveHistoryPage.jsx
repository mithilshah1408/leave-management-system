import { useEffect, useState } from "react";
import MainLayout from "../../layout/MainLayout";
import { getMyLeaves, cancelLeave } from "../../services/api";
import "./EmployeeLeaves.css";

function LeaveHistoryPage() {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchLeaves(); }, []);

  const fetchLeaves = async () => {
    try {
      const res = await getMyLeaves();
      setLeaves(res.data);
    } catch (err) {
      console.error("Failed to fetch leave history", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id) => {
    const confirmed = window.confirm("Are you sure you want to cancel this leave request?");
    if (!confirmed) return;
    try {
      await cancelLeave(id);
      fetchLeaves();
    } catch {
      alert("Failed to cancel leave request.");
    }
  };

  if (loading) {
    return <MainLayout><div className="employee-page"><p>Loading leave history...</p></div></MainLayout>;
  }

  return (
      <MainLayout>
        <div className="employee-page">
          <h2>My Leave Requests</h2>

          {leaves.length === 0 ? (
              <p className="empty-state">You have not submitted any leave requests.</p>
          ) : (
              <div className="table-wrapper">
                <table className="leave-table">
                  <thead>
                  <tr>
                    <th>Leave Type</th>
                    <th>Dates</th>
                    <th>Days</th>
                    <th>Status</th>
                    <th>Reason</th>
                    <th>Action</th>
                  </tr>
                  </thead>
                  <tbody>
                  {leaves.map((leave) => (
                      <tr key={leave.id}>
                        <td>{leave.leaveType}</td>
                        <td>{leave.startDate} → {leave.endDate}</td>
                        <td>{leave.numberOfDays}</td>
                        <td><span className={`status ${leave.status.toLowerCase()}`}>{leave.status}</span></td>
                        <td>
                          {leave.reason && <div className="employee-reason"><strong>Employee:</strong> {leave.reason}</div>}
                          {leave.status === "REJECTED" && leave.managerRemark && (
                              <div className="manager-remark"><strong>Manager:</strong> {leave.managerRemark}</div>
                          )}
                          {!leave.reason && !leave.managerRemark && <span>-</span>}
                        </td>
                        <td>
                          {leave.status === "PENDING" && (
                              <button className="cancel-btn" onClick={() => handleCancel(leave.id)}>Cancel</button>
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