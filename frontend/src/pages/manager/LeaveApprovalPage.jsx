import MainLayout from "../../layout/MainLayout";
import { useEffect, useState } from "react";
import RejectModal from "./RejectModal";
import api from "../../services/api";
import "./LeaveApprovalPage.css";

function LeaveApprovalPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedLeaveId, setSelectedLeaveId] = useState(null);
  const [remarks, setRemarks] = useState("");

  useEffect(() => { fetchRequests(); }, []);

  const fetchRequests = async () => {
    setError("");
    try {
      const res = await api.get("/leave-approvals/pending");
      setRequests(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setError("Failed to load leave requests. Please refresh.");
      console.error("Error fetching leave requests:", err);
    } finally {
      setLoading(false);
    }
  };

  const approveLeave = async (id) => {
    try {
      await api.patch(`/leave-approvals/${id}/approve`);
      fetchRequests();
    } catch (err) {
      alert("Failed to approve leave request.");
      console.error("Approve error:", err);
    }
  };

  const openRejectModal = (id) => { setSelectedLeaveId(id); setShowModal(true); };

  const handleReject = async () => {
    try {
      await api.patch(`/leave-approvals/${selectedLeaveId}/reject`, { remarks });
      setShowModal(false);
      setRemarks("");
      fetchRequests();
    } catch (err) {
      alert("Failed to reject leave request.");
      console.error("Reject error:", err);
    }
  };

  return (
      <MainLayout>
        <div className="leave-approval-container">
          <h2>Leave Approvals</h2>
          <p style={{ color:"#6b7280", marginBottom:"20px" }}>Review pending leave requests from your team.</p>

          {error && <p className="error-banner">{error}</p>}

          {loading ? (
              <p>Loading leave requests...</p>
          ) : requests.length === 0 ? (
              <div style={{ textAlign:"center", padding:"40px", color:"#6b7280" }}>
                <p style={{ fontSize:"18px", marginBottom:"8px" }}>✓ All caught up!</p>
                <p>No pending leave requests at this time.</p>
              </div>
          ) : (
              <div className="table-wrapper">
                <table className="leave-table">
                  <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Leave Type</th>
                    <th>Dates</th>
                    <th>Days</th>
                    <th>Reason</th>
                    <th>Actions</th>
                  </tr>
                  </thead>
                  <tbody>
                  {requests.map(leave => (
                      <tr key={leave.id}>
                        <td style={{ fontWeight:500 }}>{leave.employeeName}</td>
                        <td>{leave.leaveType}</td>
                        <td style={{ whiteSpace:"nowrap" }}>{leave.startDate} – {leave.endDate}</td>
                        <td style={{ textAlign:"center" }}>{leave.numberOfDays}</td>
                        <td className="reason-cell">
                          {leave.reason
                              ? <span className="reason-text">{leave.reason}</span>
                              : <span style={{ color:"#9ca3af", fontStyle:"italic" }}>No reason provided</span>
                          }
                        </td>
                        <td style={{ whiteSpace:"nowrap" }}>
                          <button className="approve-btn" onClick={() => approveLeave(leave.id)}>Approve</button>
                          <button className="reject-btn" onClick={() => openRejectModal(leave.id)}>Reject</button>
                        </td>
                      </tr>
                  ))}
                  </tbody>
                </table>
              </div>
          )}
        </div>

        <RejectModal
            show={showModal}
            remarks={remarks}
            setRemarks={setRemarks}
            onClose={() => { setShowModal(false); setRemarks(""); }}
            onConfirm={handleReject}
        />
      </MainLayout>
  );
}

export default LeaveApprovalPage;
