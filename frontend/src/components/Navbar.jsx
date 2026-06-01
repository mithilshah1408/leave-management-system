import { useNavigate } from "react-router-dom";
import "./Navbar.css";

function Navbar({ onMenuToggle }) {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.clear();
        navigate("/");
    };

    return (
        <div className="navbar">
            <button className="menu-toggle" onClick={onMenuToggle} aria-label="Toggle menu">
                ☰
            </button>
            <div className="navbar-right">
                <button className="logout-button" onClick={handleLogout}>
                    Logout
                </button>
            </div>
        </div>
    );
}

export default Navbar;