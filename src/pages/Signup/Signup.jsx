import { Navigate, Link, useNavigate } from "react-router-dom";
import { useState, useContext } from "react";
import styles from "./Signup.module.css";

const URL = "https://expense-tracker-backend-kobn.onrender.com/auth/signup";

export const Signup = () => {
    const [formData, setFormData] = useState({
        email:"",
        username:"",
        password:""
    });
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleChange = (event) => {
        const {name,value} = event.target;
        setFormData(prev => ({
            ...prev,
            [name]:value
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError("");
        if (formData.email.trim().length === 0 || formData.username.trim().length === 0 || formData.password.trim().length === 0) {
            setError("Please fill in all the fields.");
            return;
        }
        try {
            const response = await fetch(URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });
            if (response.status === 201) {
                navigate("/");
            } else if (response.status === 409) {
                setError("Username or email already exists.");
            } else if (response.status === 400) {
                setError("Please check your inputs.");
            } else {
                setError("Something went wrong. Please try again.");
            }
        }
        catch (error) {
            setError("Cannot reach server. Please try again later.");
        }
    };

    return(
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
                  <h2 className={styles.heading}>Hello New User</h2>
                  <p className={styles.subText}>Sign up for a new account</p>
        
                  <form onSubmit={handleSubmit} className={styles.form}>

                    <div className={styles.formGroup}>
                      <label htmlFor="email">Email</label>
                      <input
                        type="text"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Enter your email"
                      />
                    </div>
                    
                    <div className={styles.formGroup}>
                      <label htmlFor="username">Username</label>
                      <input
                        type="text"
                        id="username"
                        name="username"
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
                      Signup
                    </button>
        
                    {error && <p className={styles.errorText}>{error}</p>}
        
                    <p className={styles.switchText}>
                      Already have an account?{" "}
                      <Link to="/" className={styles.link}>
                        Login
                      </Link>
                    </p>
        
                  </form>
                </div>
              </div>
            </div>
    );
};