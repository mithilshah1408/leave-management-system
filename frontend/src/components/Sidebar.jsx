import { Link } from "react-router-dom";
import "./Sidebar.css";

function Sidebar({ isOpen, onClose }) {
    const role = localStorage.getItem("role");

    return (
        <>
            {isOpen && <div className="sidebar-backdrop" onClick={onClose} />}

            <div className={`sidebar ${isOpen ? "open" : ""}`}>
                <div className="sidebar-header">
                    <h2>LMS</h2>
                </div>

                <nav className="sidebar-nav">
                    {role === "ADMIN" && (
                        <>
                            <Link to="/admin" onClick={onClose}>Dashboard</Link>
                            <Link to="/admin/employees" onClick={onClose}>Employees</Link>
                            <Link to="/admin/leave-types" onClick={onClose}>Leave Types</Link>
                            <Link to="/admin/holidays" onClick={onClose}>Holidays</Link>
                            <Link to="/admin/leave-balances" onClick={onClose}>Leave Balances</Link>
                        </>
                    )}
                    {role === "MANAGER" && (
                        <>
                            <Link to="/manager" onClick={onClose}>Dashboard</Link>
                            <Link to="/manager/leave-approvals" onClick={onClose}>Leave Approvals</Link>
                            <Link to="/manager/team-history" onClick={onClose}>Team's Leave History</Link>
                        </>
                    )}
                    {role === "EMPLOYEE" && (
                        <>
                            <Link to="/employee" onClick={onClose}>Dashboard</Link>
                            <Link to="/employee/apply" onClick={onClose}>Apply Leave</Link>
                            <Link to="/employee/history" onClick={onClose}>Leave History</Link>
                        </>
                    )}
                </nav>
            </div>
        </>
    );
}

export default Sidebar;