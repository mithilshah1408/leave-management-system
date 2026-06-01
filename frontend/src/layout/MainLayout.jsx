import { useState } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

function MainLayout({ children }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div style={{ display: "flex", minHeight: "100vh", width: "100%" }}>

            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
                <Navbar onMenuToggle={() => setSidebarOpen((prev) => !prev)} />
                <main style={{ flex: 1, padding: "20px", backgroundColor: "#f8fafc" }}>
                    {children}
                </main>
            </div>

        </div>
    );
}

export default MainLayout;