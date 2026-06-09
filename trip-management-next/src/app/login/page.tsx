"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link"; 
import toast, { Toaster } from "react-hot-toast"; 
import "@/assets/styles/auth.css"; // ✅ Importing our clean CSS!

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false); 

  const handleLogin = async () => {
    if (!email || !password) {
      return toast.error("Please enter both email and password.");
    }

    setLoading(true);

    try {
      const res = await fetch("${API_BASE_URL}/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Login failed");
        setLoading(false);
        return;
      }

      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("token", data.token);

      toast.success("Login successful! 🎉");
      
      setTimeout(() => { router.push("/"); }, 1000);

    } catch (err) {
      console.error(err);
      toast.error("Network error. Could not connect to server ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <Toaster position="top-center" />

      {/* 🪟 Centered Glassmorphism Form Card */}
      <div className="auth-glass-card">
        
        {/* Header */}
        <div className="auth-header">
           <h2 className="auth-title">Welcome Back</h2>
           <p className="auth-subtitle">Enter your credentials to access your trips.</p>
        </div>

        {/* Email Input */}
        <div className="auth-form-group">
          <label className="auth-label" style={{ marginBottom: "8px" }}>Email Address</label>
          <input
            type="email"
            className="auth-input"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        {/* Password Input */}
        <div className="auth-form-group" style={{ marginBottom: "15px" }}>
          <div className="auth-label-row">
            <label className="auth-label">Password</label>
            <Link href="/forgot-password" className="auth-link">
              Forgot password?
            </Link>
          </div>
          <input
            type="password"
            className="auth-input"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {/* Primary Login Button */}
        <button 
          onClick={handleLogin}
          disabled={loading}
          className="auth-btn-primary"
        >
          {loading ? "Authenticating..." : "Sign In"}
        </button>

        {/* Divider */}
        <div className="auth-divider">
          <div className="auth-line"></div>
          <span className="auth-or">Or</span>
          <div className="auth-line"></div>
        </div>

        {/* Social Login Button */}
        <button 
          onClick={() => toast.error("Google authentication coming soon!")} 
          className="auth-btn-social"
        >
           <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" style={{ width: "20px" }}/>
           Continue with Google
        </button>

        {/* Sign Up Redirect */}
        <p className="auth-footer-text">
          Don't have an account? 
          <Link href="/signup" className="auth-footer-link">Sign up for free</Link>
        </p>

      </div>
    </div>
  );
}