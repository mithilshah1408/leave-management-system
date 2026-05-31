import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

function MainLayout({ children }) {
    return (
        <div
            style={{
                display: "flex",
                minHeight: "100vh",
                width: "100%",
            }}
        >
            <Sidebar />

            <div
                style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                }}
            >
                <Navbar />

                <main
                    style={{
                        flex: 1,
                        padding: "20px",
                        backgroundColor: "#f8fafc",
                    }}
                >
                    {children}
                </main>
            </div>
        </div>
    );
}

export default MainLayout;