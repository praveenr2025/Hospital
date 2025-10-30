import { useState } from "react";
import { useRouter } from "next/router";
import styles from "@/styles/Login.module.css";
import axios from "axios"; // IMPORTANT: Install 'axios' for API calls

// Base URL for your backend API
const API_URL = 'http://localhost:5000/api/auth/'; 

export default function LoginPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true); // Toggle between Login/Signup view
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState(""); // For Signup
  const [role, setRole] = useState("doctor");   // For Signup dropdown
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Function to handle API response and routing
  const handleAuthSuccess = (token: string, userRole: string) => {
    // 1. Store the token for session management
    localStorage.setItem('hospitalToken', token);
    
    // 2. Route based on the specific user role from the backend
    if (userRole === "admin") {
      // Maps role "admin" to path /admin/dashboard
      router.push("/admin/dashboard");
    } else if (userRole === "doctor" || userRole === "nurse" || userRole === "receptionist") {
      // Maps staff roles to the existing /clinic/dashboard
      router.push("/clinic/dashboard"); 
    } else {
      // Fallback for any unknown or default role
      router.push("/default-dashboard"); 
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await axios.post(API_URL + 'login', { email, password });
      handleAuthSuccess(response.data.token, response.data.user.role);
    } catch (err: any) {
      setError(err.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
        const response = await axios.post(API_URL + 'register', { 
            email, 
            password, 
            role, // This now includes 'admin' for testing
            full_name: fullName 
        });
        
        // Show success message and switch to login view
        alert(`Registration successful for ${response.data.user.role}. Please sign in.`); 
        
        setEmail('');
        setPassword('');
        setFullName('');
        setIsLogin(true); // Switch the form back to the Login view

    } catch (err: any) {
        setError(err.response?.data?.message || "Registration failed. Please try again.");
    } finally {
        setLoading(false);
    }
  };

  const handleSubmit = isLogin ? handleLogin : handleRegister;

  return (
    <div className={styles.page}>
      <div className={styles.loginContainer}>
        <div className={styles.logo}>🏥</div>
        <h1>{isLogin ? "Welcome Back" : "Register New Staff"}</h1>
        <p className={styles.sub}>
          {isLogin ? "Log in to access your Portal" : "Sign up for a new account"}
        </p>

        {error && <div className={styles.errorMessage}>{error}</div>}

        <form onSubmit={handleSubmit}>
          {/* Full Name for Signup */}
          {!isLogin && (
            <div className={styles.formGroup}>
              <label>Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required={!isLogin}
              />
            </div>
          )}

          {/* Email */}
          <div className={styles.formGroup}>
            <label>Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/* Password */}
          <div className={styles.formGroup}>
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {/* Role Dropdown for Signup */}
          {!isLogin && (
            <div className={styles.formGroup}>
              <label>Select Your Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                required={!isLogin}
                className={styles.selectInput}
              >
                {/* --- ADMIN ROLE ADDED FOR TESTING --- */}
                <option value="admin">Admin</option>
                {/* ------------------------------------ */}
                <option value="doctor">Doctor</option>
                <option value="nurse">Nurse</option>
                <option value="receptionist">Receptionist</option>
              </select>
            </div>
          )}

          <div className={styles.formLinks}>
            <a href="#">Forgot Password?</a>
            <a href="#" onClick={() => setIsLogin(!isLogin)} role="button">
              {isLogin ? "Need an Account? Sign Up" : "Already have an account? Sign In"}
            </a>
          </div>

          <button className={styles.btn} type="submit" disabled={loading}>
            {loading ? "Processing..." : isLogin ? "Sign In" : "Register"}
          </button>
        </form>
      </div>
    </div>
  );
}