import { useState, useContext, useEffect } from "react";
import { useNavigate, useLocation } from 'react-router-dom';
import styles from "./Sidebar.module.css";
import { AuthContext } from "../context/AuthContext";

const GET_USERDETAILS_URL = "http://localhost:8080/user/me";

export const Sidebar = () => {

    const { setIsAuthenticated } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();
    const [user, setUser] = useState(null);

    const handleLogout = () => {
        localStorage.removeItem("token");
        setIsAuthenticated(false);
        navigate("/", { replace: true });
    };

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await fetch(GET_USERDETAILS_URL, {
                    method:"GET",
                    headers: {
                        "Authorization": `Bearer ${localStorage.getItem("token")}`
                    }
                });
                if(response.ok) {
                    const data = await response.json();
                    setUser(data);
                }
                else if (response.status === 401) {
                    localStorage.removeItem("token");
                    setIsAuthenticated(false);
                    navigate("/");
                }
            } catch (error) {
                console.log("Failed to fetch user");
                return;
            }
        };
        fetchUser();
    },[]);

    return (
        <div className={styles.container}>

            <div className={styles.topPanel}>
                <h2 className={styles.appTitle}>💸 ExpenseTracker</h2>

                <div className={styles.navSection}>
                    <p className={styles.sectionLabel}>MAIN</p>
                    <ul className={styles.navList}>
                        <li 
                            className={`${styles.navItem} ${location.pathname === "/dashboard" ? styles.active : ""}`}
                            onClick={() => navigate("/dashboard")}
                        >
                            🏠 Dashboard
                        </li>
                        <li 
                            className={`${styles.navItem} ${location.pathname === "/analytics" ? styles.active : ""}`}
                            onClick={() => navigate("/analytics")}
                        >
                            📊 Analytics
                        </li>
                    </ul>
                </div>

                <div className={styles.navSection}>
                    <p className={styles.sectionLabel}>ACCOUNT</p>
                    <ul className={styles.navList}>
                        <li 
                            className={`${styles.navItem} ${location.pathname === "/profile" ? styles.active : ""}`}
                            onClick={() => navigate("/profile")}
                        >
                            👤 Profile
                        </li>
                    </ul>
                </div>
            </div>

            <div className={styles.bottomPanel}>
                <div className={styles.userChip}>
                    <div className={styles.avatar}>{user?.username?.charAt(0).toUpperCase()}</div>
                    <div>
                        <p className={styles.userName}>{user?.username}</p>
                        <p className={styles.userSub}>My Account</p>
                    </div>
                </div>
                <div className={styles.navItem} onClick={handleLogout}>🚪 Logout</div>
            </div>

        </div>
    );
};