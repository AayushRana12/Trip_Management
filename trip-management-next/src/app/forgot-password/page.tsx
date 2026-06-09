"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast, { Toaster } from "react-hot-toast";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return toast.error("Please enter your email.");

    setLoading(true);
    try {
      const res = await fetch("http://localhost:8000/api/forgot-password/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(data.message);
        setStep(2); // Move to OTP verification step
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || !newPassword) return toast.error("Please fill all fields.");
    if (newPassword.length < 6) return toast.error("Password must be at least 6 characters.");

    setLoading(true);
    try {
      const res = await fetch("http://localhost:8000/api/forgot-password/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, newPassword }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(data.message);
        setTimeout(() => router.push("/login"), 2000);
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center", background: "#f8fafc", padding: "20px", fontFamily: "sans-serif" }}>
      <Toaster position="top-center" />
      
      <div style={{ width: "100%", maxWidth: "450px", background: "white", padding: "40px", borderRadius: "20px", boxShadow: "0 10px 25px rgba(0,0,0,0.05)", border: "1px solid #e2e8f0" }}>
        
        <div style={{ textAlign: "center", marginBottom: "30px" }}>
          <h2 style={{ margin: "0 0 10px 0", fontSize: "28px", color: "#0f172a", fontWeight: "800" }}>
            {step === 1 ? "Forgot Password?" : "Reset Password"}
          </h2>
          <p style={{ color: "#64748b", margin: 0, fontSize: "15px" }}>
            {step === 1 
              ? "Enter your email address and we'll send you an OTP to reset your password." 
              : `Enter the OTP sent to ${email} and your new password.`}
          </p>
        </div>

        {step === 1 ? (
          <form onSubmit={handleSendOTP} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: "700", color: "#1e293b", fontSize: "14px" }}>Email Address</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                required
                style={{ width: "100%", padding: "14px", borderRadius: "10px", border: "2px solid #e2e8f0", fontSize: "15px", outline: "none", transition: "border-color 0.2s" }}
              />
            </div>
            
            <button 
              type="submit" 
              disabled={loading}
              style={{ padding: "16px", background: "#3b82f6", color: "white", border: "none", borderRadius: "10px", fontSize: "16px", fontWeight: "bold", cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1 }}
            >
              {loading ? "Sending OTP..." : "Send Reset OTP"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: "700", color: "#1e293b", fontSize: "14px" }}>Enter 6-Digit OTP</label>
              <input 
                type="text" 
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="000000"
                maxLength={6}
                required
                style={{ width: "100%", padding: "14px", borderRadius: "10px", border: "2px solid #e2e8f0", fontSize: "20px", letterSpacing: "5px", textAlign: "center", outline: "none" }}
              />
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: "700", color: "#1e293b", fontSize: "14px" }}>New Password</label>
              <input 
                type="password" 
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                required
                style={{ width: "100%", padding: "14px", borderRadius: "10px", border: "2px solid #e2e8f0", fontSize: "15px", outline: "none" }}
              />
            </div>
            
            <button 
              type="submit" 
              disabled={loading}
              style={{ padding: "16px", background: "#16a34a", color: "white", border: "none", borderRadius: "10px", fontSize: "16px", fontWeight: "bold", cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1 }}
            >
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </form>
        )}

        <div style={{ textAlign: "center", marginTop: "25px" }}>
          <Link href="/login" style={{ color: "#3b82f6", fontWeight: "bold", textDecoration: "none", fontSize: "14px" }}>
            ← Back to Login
          </Link>
        </div>

      </div>
    </div>
  );
}