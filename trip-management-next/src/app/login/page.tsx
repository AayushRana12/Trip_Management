"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link"; 
import toast, { Toaster } from "react-hot-toast"; 
import "@/assets/styles/auth.css"; 

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
      const res = await fetch("http://localhost:8000/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Login failed");
        setLoading(false);
        return;
      }

      // 1. SAVE FULL USER
      localStorage.setItem("user", JSON.stringify(data.user));

      // 2. SAVE SECURE JWT TOKEN
      localStorage.setItem("token", data.token);

      toast.success("Login successful! 🎉");
      
      setTimeout(() => {
        router.push("/");
      }, 1000);

    } catch (err) {
      console.error(err);
      toast.error("Network error. Could not connect to server ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "calc(100vh - 70px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "20px",
      /* 📸 Coastal Twilight Background (Matches your Hero Page!) */
      backgroundImage: "linear-gradient(rgba(15, 23, 42, 0.4), rgba(15, 23, 42, 0.8)), url('https://images.unsplash.com/photo-1499678329028-101435549a4e?q=80&w=2000&auto=format&fit=crop')",
      backgroundSize: "cover",
      backgroundPosition: "center",
      fontFamily: "'Inter', sans-serif"
    }}>
      <Toaster position="top-center" />

      {/* 🪟 Centered Glassmorphism Form Card */}
      <div style={{
        background: "rgba(255, 255, 255, 0.95)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        padding: "50px 40px",
        borderRadius: "24px",
        width: "100%",
        maxWidth: "450px",
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
        border: "1px solid rgba(255,255,255,0.4)"
      }}>
        
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "30px" }}>
           <h2 style={{ fontSize: "32px", fontWeight: "900", color: "#0f172a", margin: "0 0 10px 0", letterSpacing: "-1px" }}>Welcome Back</h2>
           <p style={{ color: "#64748b", margin: 0, fontSize: "15px", fontWeight: "500" }}>Enter your credentials to access your trips.</p>
        </div>

        {/* Email Input */}
        <div style={{ marginBottom: "20px" }}>
          <label style={{ display: "block", color: "#334155", fontWeight: "700", marginBottom: "8px", fontSize: "14px" }}>Email Address</label>
          <input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ 
              width: "100%", boxSizing: "border-box", padding: "14px 16px", borderRadius: "12px", 
              border: "1px solid #cbd5e1", background: "#f8fafc", outline: "none", 
              fontSize: "15px", transition: "border 0.2s, box-shadow 0.2s" 
            }}
            onFocus={(e) => { e.currentTarget.style.borderColor = "#2563eb"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(37,99,235,0.1)"; }}
            onBlur={(e) => { e.currentTarget.style.borderColor = "#cbd5e1"; e.currentTarget.style.boxShadow = "none"; }}
          />
        </div>

        {/* Password Input */}
        <div style={{ marginBottom: "15px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <label style={{ color: "#334155", fontWeight: "700", fontSize: "14px" }}>Password</label>
            <Link href="/forgot-password" style={{ color: "#2563eb", fontSize: "13px", textDecoration: "none", fontWeight: "700" }}>
              Forgot password?
            </Link>
          </div>
          <input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ 
              width: "100%", boxSizing: "border-box", padding: "14px 16px", borderRadius: "12px", 
              border: "1px solid #cbd5e1", background: "#f8fafc", outline: "none", 
              fontSize: "15px", transition: "border 0.2s, box-shadow 0.2s" 
            }}
            onFocus={(e) => { e.currentTarget.style.borderColor = "#2563eb"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(37,99,235,0.1)"; }}
            onBlur={(e) => { e.currentTarget.style.borderColor = "#cbd5e1"; e.currentTarget.style.boxShadow = "none"; }}
          />
        </div>

        {/* Primary Login Button */}
        <button 
          onClick={handleLogin}
          disabled={loading}
          style={{ 
            width: "100%", marginTop: "10px", padding: "16px", background: loading ? "#94a3b8" : "#2563eb", 
            color: "white", border: "none", borderRadius: "12px", fontSize: "16px", fontWeight: "800",
            cursor: loading ? "not-allowed" : "pointer", transition: "all 0.2s",
            boxShadow: loading ? "none" : "0 4px 12px rgba(37, 99, 235, 0.3)"
          }}
          onMouseOver={(e) => { if (!loading) { e.currentTarget.style.background = "#1d4ed8"; e.currentTarget.style.transform = "translateY(-2px)"; } }}
          onMouseOut={(e) => { if (!loading) { e.currentTarget.style.background = "#2563eb"; e.currentTarget.style.transform = "translateY(0)"; } }}
        >
          {loading ? "Authenticating..." : "Sign In"}
        </button>

        {/* Divider */}
        <div style={{ display: "flex", alignItems: "center", margin: "25px 0" }}>
          <div style={{ flex: 1, height: "1px", background: "#e2e8f0" }}></div>
          <span style={{ padding: "0 15px", color: "#94a3b8", fontSize: "13px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "1px" }}>Or</span>
          <div style={{ flex: 1, height: "1px", background: "#e2e8f0" }}></div>
        </div>

        {/* Social Login Button */}
        <button 
          onClick={() => toast.error("Google authentication coming soon!")} 
          style={{ 
            display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", 
            width: "100%", padding: "14px", background: "white", border: "1px solid #cbd5e1", 
            borderRadius: "12px", color: "#334155", fontSize: "15px", fontWeight: "700", 
            cursor: "pointer", transition: "all 0.2s", boxShadow: "0 2px 4px rgba(0,0,0,0.02)" 
          }} 
          onMouseOver={(e) => { e.currentTarget.style.background = "#f8fafc"; e.currentTarget.style.borderColor = "#94a3b8"; }}
          onMouseOut={(e) => { e.currentTarget.style.background = "white"; e.currentTarget.style.borderColor = "#cbd5e1"; }}
        >
           <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" style={{ width: "20px" }}/>
           Continue with Google
        </button>

        {/* Sign Up Redirect */}
        <p style={{ textAlign: "center", margin: "30px 0 0 0", color: "#64748b", fontSize: "14px", fontWeight: "500" }}>
          Don't have an account? <Link href="/signup" style={{ color: "#2563eb", fontWeight: "800", textDecoration: "none", marginLeft: "5px" }}>Sign up for free</Link>
        </p>

      </div>
    </div>
  );
}