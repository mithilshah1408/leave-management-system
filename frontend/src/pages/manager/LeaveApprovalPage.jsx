import MainLayout from "../../layout/MainLayout";
import { useEffect, useState } from "react";
import RejectModal from "./RejectModal";
import "./LeaveApprovalPage.css";

function LeaveApprovalPage() {

  const [requests, setRequests] = useState([]);

  const [showModal, setShowModal] = useState(false);
  const [selectedLeaveId, setSelectedLeaveId] = useState(null);
  const [remarks, setRemarks] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {

    try {

      const response = await fetch(
        "/api/leave-approvals/pending",
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (!response.ok) throw new Error("Failed to fetch requests");

      const data = await response.json();

      setRequests(Array.isArray(data) ? data : []);

    } catch (error) {

      console.error("Error fetching leave requests:", error);
      setRequests([]);

    }
  };

  const approveLeave = async (id) => {

    try {

      await fetch(
        `/api/leave-approvals/${id}/approve`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      fetchRequests();

    } catch (error) {

      console.error("Approve error:", error);

    }
  };

  const openRejectModal = (id) => {

    setSelectedLeaveId(id);
    setShowModal(true);

  };

  const handleReject = async () => {

    try {

      await fetch(
        `/api/leave-approvals/${selectedLeaveId}/reject`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ remarks })
        }
      );

      setShowModal(false);
      setRemarks("");
      fetchRequests();

    } catch (error) {

      console.error("Reject error:", error);

    }
  };

  return (
    <MainLayout>

      <div className="leave-approval-container">

        <h2>Leave Approvals</h2>

        <table className="leave-table">

          <thead>
            <tr>
              <th>Employee</th>
              <th>Leave Type</th>
              <th>Dates</th>
              <th>Days</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>

            {requests.map((leave) => (

              <tr key={leave.id}>

                <td>{leave.employeeName}</td>

                <td>{leave.leaveType}</td>

                <td>
                  {leave.startDate} - {leave.endDate}
                </td>

                <td>{leave.numberOfDays}</td>

                <td>

                  <button
                    className="approve-btn"
                    onClick={() => approveLeave(leave.id)}
                  >
                    Approve
                  </button>

                  <button
                    className="reject-btn"
                    onClick={() => openRejectModal(leave.id)}
                  >
                    Reject
                  </button>

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

      <RejectModal
        show={showModal}
        remarks={remarks}
        setRemarks={setRemarks}
        onClose={() => setShowModal(false)}
        onConfirm={handleReject}
      />

    </MainLayout>
  );
}

export default LeaveApprovalPage;