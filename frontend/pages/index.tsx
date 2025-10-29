import { useState } from "react";
import { useRouter } from "next/router";
import styles from "@/styles/Login.module.css";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // Hardcoded demo users
  const users: Record<string, string> = {
    "admin@hospital.com": "admin",
    "doctor@hospital.com": "staff",
  };
  const demoPassword = "password123";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const role = users[email];

    if (role && password === demoPassword) {
      if (role === "admin") router.push("/admin/dashboard");
      else if (role === "staff") router.push("/clinic/dashboard");
    } else {
      setError("Invalid email or password.");
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.loginContainer}>
        <div className={styles.logo}>🏥</div>
        <h1>Welcome Back</h1>
        <p className={styles.sub}>Log in to access your Hospital Portal</p>

        {error && <div className={styles.errorMessage}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label>Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className={styles.formLinks}>
            <a href="#">Forgot Password?</a>
            <a href="#">Sign Up</a>
          </div>

          <button className={styles.btn} type="submit">
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
}
