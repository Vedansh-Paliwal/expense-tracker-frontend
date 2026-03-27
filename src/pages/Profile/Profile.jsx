import { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { Sidebar } from "../../components/Sidebar";
import styles from "./Profile.module.css";

const GET_USERDETAILS_URL = "https://expense-tracker-backend-kobn.onrender.comhttp://localhost:8080/user/me";
const UPDATE_USER_URL = "https://expense-tracker-backend-kobn.onrender.com/user";
const DELETE_USER_URL = "https://expense-tracker-backend-kobn.onrender.com/user";

export const Profile = () => {
    const navigate = useNavigate();
    const { setIsAuthenticated } = useContext(AuthContext);

    const [user, setUser] = useState(null);
    const [formData, setFormData] = useState({
        username: "",
        oldPassword: "",
        newPassword: "",
        confirmPassword: ""
    });
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await fetch(GET_USERDETAILS_URL, {
                    method: "GET",
                    headers: {
                        "Authorization": `Bearer ${localStorage.getItem("token")}`
                    }
                });
                if (response.ok) {
                    const data = await response.json();
                    setUser(data);
                    setFormData(prev => ({ ...prev, username: data.username }));
                } else if (response.status === 401) {
                    localStorage.removeItem("token");
                    setIsAuthenticated(false);
                    navigate("/");
                }
            } catch (e) {
                console.log("Failed to fetch user");
            }
        };
        fetchUser();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (!formData.username.trim() || !formData.oldPassword.trim() || !formData.newPassword.trim() || !formData.confirmPassword.trim()) {
            setError("Please fill in all fields.");
            return;
        }
        if (formData.newPassword !== formData.confirmPassword) {
            setError("New password and confirm password do not match.");
            return;
        }

        try {
            const response = await fetch(UPDATE_USER_URL, {
                method: "PUT",
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem("token")}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    username: formData.username,
                    oldPassword: formData.oldPassword,
                    newPassword: formData.newPassword
                })
            });
            if (response.status === 204) {
                setSuccess("Profile updated successfully!");
                setTimeout(() => {
                    setSuccess("");
                }, 3000);
                setFormData(prev => ({ ...prev, oldPassword: "", newPassword: "", confirmPassword: "" }));
                setUser(prev => ({ ...prev, username: formData.username }));
            } else if (response.status === 401) {
                localStorage.removeItem("token");
                setIsAuthenticated(false);
                navigate("/");
            } else if (response.status === 400) {
                setError("Old password is incorrect.");
            } else {
                setError("Something went wrong. Please try again.");
            }
        } catch (e) {
            setError("Network error. Can't reach server.");
        }
    };

    const handleDelete = async () => {
        try {
            const response = await fetch(DELETE_USER_URL, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem("token")}`
                }
            });
            if (response.status === 204) {
                localStorage.removeItem("token");
                setIsAuthenticated(false);
                navigate("/");
            } else if (response.status === 401) {
                localStorage.removeItem("token");
                setIsAuthenticated(false);
                navigate("/");
            } else {
                setError("Failed to delete account. Please try again.");
                setIsDeleteOpen(false);
            }
        } catch (e) {
            setError("Network error. Can't reach server.");
            setIsDeleteOpen(false);
        }
    };

    if (!user) return <p>Loading...</p>;

    return (
        <>
            <Sidebar />
            <div className={styles.container}>
                <h1 className={styles.pageTitle}>Profile</h1>

                <div className={styles.card}>
                    <div className={styles.avatarSection}>
                        <div className={styles.avatar}>
                            {user.username?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <p className={styles.avatarName}>{user.username}</p>
                            <p className={styles.avatarEmail}>{user.email}</p>
                        </div>
                    </div>
                </div>

                <div className={styles.card}>
                    <h2 className={styles.cardTitle}>Update Profile</h2>
                    <form onSubmit={handleUpdate} className={styles.form}>
                        <div className={styles.formGroup}>
                            <label>Username</label>
                            <input
                                type="text"
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                placeholder="Enter new username"
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label>Current Password</label>
                            <input
                                type="password"
                                name="oldPassword"
                                value={formData.oldPassword}
                                onChange={handleChange}
                                placeholder="Enter current password"
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label>New Password</label>
                            <input
                                type="password"
                                name="newPassword"
                                value={formData.newPassword}
                                onChange={handleChange}
                                placeholder="Enter new password"
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label>Confirm New Password</label>
                            <input
                                type="password"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                placeholder="Confirm new password"
                            />
                        </div>
                        {error && <p className={styles.error}>{error}</p>}
                        {success && <p className={styles.success}>{success}</p>}
                        <button type="submit" className={styles.updateBtn}>Save Changes</button>
                    </form>
                </div>

                <div className={`${styles.card} ${styles.dangerCard}`}>
                    <h2 className={styles.cardTitle}>Danger Zone</h2>
                    <p className={styles.dangerText}>Deleting your account is permanent and cannot be undone. All your expenses and data will be lost.</p>
                    <button className={styles.deleteBtn} onClick={() => setIsDeleteOpen(true)}>Delete Account</button>
                </div>

                {isDeleteOpen && (
                    <div className={styles.modalOverlay} onClick={() => setIsDeleteOpen(false)}>
                        <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                            <h2>Are you sure?</h2>
                            <p>This will permanently delete your account and all associated data. This action cannot be undone.</p>
                            <div className={styles.modalButtons}>
                                <button className={styles.cancelBtn} onClick={() => setIsDeleteOpen(false)}>Cancel</button>
                                <button className={styles.confirmDeleteBtn} onClick={handleDelete}>Yes, Delete My Account</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};