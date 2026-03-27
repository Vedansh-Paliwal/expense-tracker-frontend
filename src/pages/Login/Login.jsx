import { useNavigate, Link } from "react-router-dom";
import { useState, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import styles from "./Login.module.css";

const URL = "https://expense-tracker-backend-kobn.onrender.com/auth/login";

export const Login = () => {
  const [formData, setFormData] = useState({login: "",password: ""});
  const [error, setError] = useState("");
  const { setIsAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const {name, value} = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    if(formData.login.trim().length === 0 || formData.password.trim().length === 0) {
      setError("Please fill in all the fields.");
      return;
    }
    try {
      const response = await fetch(URL, {
        method: "POST",
        headers: {
          "Content-Type" : "application/json"
        },
        body: JSON.stringify(formData)
      });
      const data = await response.text();
      if(response.ok) {
        localStorage.setItem("token", data);
        setIsAuthenticated(true);
        navigate("/dashboard");
      }
      else if(response.status === 401) {
        setError("Invalid username or password");
      }
      else if(response.status === 400) {
        setError("Please check your inputs");
      }
      else {
        setError("Something went wrong. Please try again.");
      }
    }
    catch(error) {
      setError("Cannot reach server. Please try again later.");
    }
  }

  return (
    <div className={styles.container}>
      
      {/* Left Branding Panel */}
      <div className={styles.leftPanel}>
        <div className={styles.brandContent}>
          <h1 className={styles.appTitle}>ExpenseTracker</h1>
          <p className={styles.tagline}>
            Track smarter. Spend better. Save more.
          </p>
        </div>
      </div>

      {/* Right Form Panel */}
      <div className={styles.rightPanel}>
        <div className={styles.formCard}>
          <h2 className={styles.heading}>Welcome Back</h2>
          <p className={styles.subText}>Login to your account</p>

          <form onSubmit={handleSubmit} className={styles.form}>
            
            <div className={styles.formGroup}>
              <label htmlFor="username">Username</label>
              <input
                type="text"
                id="username"
                name="login"
                value={formData.username}
                onChange={handleChange}
                placeholder="Enter your username"
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
              />
            </div>

            <button type="submit" className={styles.loginButton}>
              Login
            </button>

            {error && <p className={styles.errorText}>{error}</p>}

            <p className={styles.switchText}>
              Don't have an account?{" "}
              <Link to="/signup" className={styles.link}>
                Signup
              </Link>
            </p>

          </form>
        </div>
      </div>
    </div>
  );
};