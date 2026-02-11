import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";

export default function AuthPage() {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState("signin"); // "signin" | "signup"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!email || !password) {
      setError("Email and password are required.");
      return;
    }

    if (mode === "signup") {
      if (password.length < 8) {
        setError("Password must be at least 8 characters.");
        return;
      }
      if (password !== confirmPassword) {
        setError("Passwords do not match.");
        return;
      }
    }

    setSubmitting(true);
    try {
      if (mode === "signin") {
        await signIn(email, password);
      } else {
        await signUp(email, password);
        setMessage("Account created! Check your email to confirm, then sign in.");
        setMode("signin");
        setPassword("");
        setConfirmPassword("");
      }
    } catch (err) {
      setError(err.message || "Authentication failed.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h1 style={styles.title}>Public Inquiry Consulting Tool</h1>
          <p style={styles.subtitle}>Structured assessment and gap analysis for inquiry teams</p>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <h2 style={styles.formTitle}>{mode === "signin" ? "Sign In" : "Create Account"}</h2>

          {error && <div style={styles.error}>{error}</div>}
          {message && <div style={styles.success}>{message}</div>}

          <label style={styles.label}>Email</label>
          <input
            style={styles.input}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
          />

          <label style={styles.label}>Password</label>
          <input
            style={styles.input}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={mode === "signup" ? "At least 8 characters" : "Enter your password"}
            autoComplete={mode === "signin" ? "current-password" : "new-password"}
          />

          {mode === "signup" && (
            <>
              <label style={styles.label}>Confirm Password</label>
              <input
                style={styles.input}
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                autoComplete="new-password"
              />
            </>
          )}

          <button style={styles.submitBtn} type="submit" disabled={submitting}>
            {submitting ? "Please wait..." : mode === "signin" ? "Sign In" : "Create Account"}
          </button>

          <p style={styles.toggle}>
            {mode === "signin" ? (
              <>
                Don&apos;t have an account?{" "}
                <button type="button" style={styles.toggleBtn} onClick={() => { setMode("signup"); setError(""); setMessage(""); }}>
                  Create one
                </button>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <button type="button" style={styles.toggleBtn} onClick={() => { setMode("signin"); setError(""); setMessage(""); }}>
                  Sign in
                </button>
              </>
            )}
          </p>
        </form>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#f8f9fb",
    fontFamily: "'Segoe UI', Arial, sans-serif",
    padding: 24,
  },
  card: {
    width: "100%",
    maxWidth: 440,
    borderRadius: 16,
    overflow: "hidden",
    boxShadow: "0 4px 24px rgba(0,0,0,0.1)",
  },
  header: {
    background: "linear-gradient(135deg, #1B2A4A 0%, #2C3E6B 100%)",
    color: "#fff",
    padding: "32px 32px 24px",
    textAlign: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: 700,
    margin: 0,
    letterSpacing: "-0.3px",
  },
  subtitle: {
    fontSize: 13,
    opacity: 0.8,
    margin: "6px 0 0",
  },
  form: {
    background: "#fff",
    padding: "28px 32px 32px",
  },
  formTitle: {
    fontSize: 18,
    fontWeight: 600,
    color: "#1B2A4A",
    margin: "0 0 20px",
  },
  label: {
    display: "block",
    fontSize: 13,
    fontWeight: 500,
    color: "#4a5568",
    marginBottom: 4,
    marginTop: 14,
  },
  input: {
    width: "100%",
    padding: "10px 14px",
    borderRadius: 8,
    border: "1px solid #d0d7e2",
    fontSize: 14,
    fontFamily: "inherit",
    outline: "none",
    background: "#fafbfd",
    boxSizing: "border-box",
  },
  submitBtn: {
    width: "100%",
    padding: "12px 0",
    borderRadius: 8,
    border: "none",
    background: "linear-gradient(135deg, #1B2A4A 0%, #2C3E6B 100%)",
    color: "#fff",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    marginTop: 24,
    transition: "opacity 0.2s",
  },
  toggle: {
    textAlign: "center",
    fontSize: 13,
    color: "#718096",
    marginTop: 16,
    marginBottom: 0,
  },
  toggleBtn: {
    background: "none",
    border: "none",
    color: "#3A5BA0",
    fontWeight: 600,
    cursor: "pointer",
    fontSize: 13,
    padding: 0,
  },
  error: {
    background: "#FEE2E2",
    color: "#C00000",
    padding: "10px 14px",
    borderRadius: 8,
    fontSize: 13,
    marginBottom: 8,
  },
  success: {
    background: "#D1FAE5",
    color: "#065F46",
    padding: "10px 14px",
    borderRadius: 8,
    fontSize: 13,
    marginBottom: 8,
  },
};
