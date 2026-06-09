"use client";
import { API_BASE_URL } from "@/config";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";

type UserProfile = {
  id: number;
  username: string;
  email: string;
  role: string;
  contact_number?: string;
  city?: string;
};

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("details"); // 'details' or 'security'

  // Form State for basic info
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    contact_number: "",
    city: "",
  });

  // Form State for password change
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    if (!token || !storedUser) {
      toast.error("Please login to view your profile");
      router.push("/login");
      return;
    }

    try {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      setFormData({
        username: parsedUser.username || "",
        email: parsedUser.email || "",
        contact_number: parsedUser.contact_number || "",
        city: parsedUser.city || "",
      });
    } catch (err) {
      console.error("Failed to parse user data");
    } finally {
      setLoading(false);
    }
  }, [router]);

  // ✅ Handle Profile Details Update
  const handleUpdateProfile = async () => {
    if (!formData.username.trim() || !formData.email.trim()) {
      return toast.error("Username and Email cannot be empty.");
    }

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/api/users/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` 
        },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        const updatedData = await res.json();
        toast.success("Profile updated successfully! ✨");
        
        const updatedUser = { ...user, ...formData, ...updatedData };
        setUser(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));
        setIsEditing(false); 
      } else {
        const errorData = await res.json();
        toast.error(errorData.message || "Failed to update profile.");
      }
    } catch (err) {
      toast.error("Network error. Could not connect to server.");
    }
  };

  // ✅ Handle Password Change
  const handleChangePassword = async () => {
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      return toast.error("Please fill in all password fields.");
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      return toast.error("New passwords do not match!");
    }
    if (passwordData.newPassword.length < 6) {
      return toast.error("New password must be at least 6 characters.");
    }

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/api/users/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` 
        },
        // We send the current user details + password change request
        body: JSON.stringify({ ...formData, ...passwordData }),
      });

      if (res.ok) {
        toast.success("Password changed successfully! 🔒");
        setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      } else {
        const errorData = await res.json();
        toast.error(errorData.message || "Failed to change password.");
      }
    } catch (err) {
      toast.error("Network error. Could not connect to server.");
    }
  };

  if (loading) return <p style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>Loading Profile...</p>;
  if (!user) return null;

  const initial = user.username.charAt(0).toUpperCase();

  return (
    <div style={{ minHeight: "80vh", backgroundColor: "#f8fafc", padding: "40px 20px", display: "flex", justifyContent: "center", alignItems: "flex-start" }}>
      <Toaster position="top-center" />

      <div style={{ background: "white", width: "100%", maxWidth: "550px", borderRadius: "16px", padding: "30px", boxShadow: "0 10px 25px rgba(0,0,0,0.05)" }}>
        
        {/* HEADER / AVATAR */}
        <div style={{ textAlign: "center" }}>
          <div style={{ width: "80px", height: "80px", borderRadius: "50%", background: "#3b82f6", color: "white", fontSize: "36px", fontWeight: "bold", display: "flex", justifyContent: "center", alignItems: "center", margin: "0 auto 15px auto", boxShadow: "0 4px 10px rgba(59, 130, 246, 0.3)" }}>
            {initial}
          </div>
          <h2 style={{ fontSize: "24px", color: "#1e293b", margin: "0 0 5px 0" }}>{user.username}</h2>
          <p style={{ color: "#64748b", fontSize: "14px", margin: "0 0 20px 0" }}>
            Role: <span style={{ fontWeight: "bold", color: user.role === "admin" ? "#ef4444" : "#16a34a", textTransform: "capitalize" }}>{user.role || "User"}</span>
          </p>
        </div>

        {/* TABS */}
        <div style={{ display: "flex", borderBottom: "2px solid #e2e8f0", marginBottom: "25px" }}>
          <button 
            onClick={() => setActiveTab("details")}
            style={{ flex: 1, padding: "10px", background: "none", border: "none", borderBottom: activeTab === "details" ? "3px solid #3b82f6" : "3px solid transparent", color: activeTab === "details" ? "#3b82f6" : "#64748b", fontWeight: "bold", cursor: "pointer", transition: "all 0.2s" }}
          >
            Profile Details
          </button>
          <button 
            onClick={() => setActiveTab("security")}
            style={{ flex: 1, padding: "10px", background: "none", border: "none", borderBottom: activeTab === "security" ? "3px solid #3b82f6" : "3px solid transparent", color: activeTab === "security" ? "#3b82f6" : "#64748b", fontWeight: "bold", cursor: "pointer", transition: "all 0.2s" }}
          >
            Security
          </button>
        </div>

        {/* ================= TAB 1: DETAILS ================= */}
        {activeTab === "details" && (
          <div style={{ animation: "fadeIn 0.3s" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px", marginBottom: "20px" }}>
              <div>
                <label style={{ display: "block", fontSize: "13px", color: "#64748b", marginBottom: "5px" }}>Username</label>
                {isEditing ? (
                  <input type="text" value={formData.username} onChange={(e) => setFormData({...formData, username: e.target.value})} style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1" }} />
                ) : (
                  <div style={{ padding: "10px", background: "#f8fafc", borderRadius: "8px", color: "#334155", fontWeight: "500" }}>{user.username}</div>
                )}
              </div>
              <div>
                <label style={{ display: "block", fontSize: "13px", color: "#64748b", marginBottom: "5px" }}>Email</label>
                {isEditing ? (
                  <input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1" }} />
                ) : (
                  <div style={{ padding: "10px", background: "#f8fafc", borderRadius: "8px", color: "#334155", fontWeight: "500" }}>{user.email}</div>
                )}
              </div>
              <div>
                <label style={{ display: "block", fontSize: "13px", color: "#64748b", marginBottom: "5px" }}>Phone Number</label>
                {isEditing ? (
                  <input type="text" placeholder="Not provided" value={formData.contact_number} onChange={(e) => setFormData({...formData, contact_number: e.target.value})} style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1" }} />
                ) : (
                  <div style={{ padding: "10px", background: "#f8fafc", borderRadius: "8px", color: "#334155", fontWeight: "500" }}>{user.contact_number || "—"}</div>
                )}
              </div>
              <div>
                <label style={{ display: "block", fontSize: "13px", color: "#64748b", marginBottom: "5px" }}>City</label>
                {isEditing ? (
                  <input type="text" placeholder="Not provided" value={formData.city} onChange={(e) => setFormData({...formData, city: e.target.value})} style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1" }} />
                ) : (
                  <div style={{ padding: "10px", background: "#f8fafc", borderRadius: "8px", color: "#334155", fontWeight: "500" }}>{user.city || "—"}</div>
                )}
              </div>
            </div>

            {isEditing ? (
              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={handleUpdateProfile} style={{ flex: 1, padding: '12px', background: '#16a34a', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>Save Changes</button>
                <button onClick={() => { setIsEditing(false); setFormData({ username: user.username, email: user.email, contact_number: user.contact_number || "", city: user.city || "" }); }} style={{ flex: 1, padding: '12px', background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>Cancel</button>
              </div>
            ) : (
              <button onClick={() => setIsEditing(true)} style={{ width: "100%", padding: '12px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>Edit Profile</button>
            )}
          </div>
        )}

        {/* ================= TAB 2: SECURITY (PASSWORD) ================= */}
        {activeTab === "security" && (
          <div style={{ animation: "fadeIn 0.3s" }}>
            <h3 style={{ fontSize: "18px", marginBottom: "15px", color: "#1e293b" }}>Change Password</h3>
            
            <div style={{ marginBottom: "15px" }}>
              <label style={{ display: "block", fontSize: "13px", color: "#64748b", marginBottom: "5px" }}>Current Password</label>
              <input type="password" value={passwordData.currentPassword} onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})} style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1" }} />
            </div>
            
            <div style={{ marginBottom: "15px" }}>
              <label style={{ display: "block", fontSize: "13px", color: "#64748b", marginBottom: "5px" }}>New Password</label>
              <input type="password" value={passwordData.newPassword} onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})} style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1" }} />
            </div>

            <div style={{ marginBottom: "25px" }}>
              <label style={{ display: "block", fontSize: "13px", color: "#64748b", marginBottom: "5px" }}>Confirm New Password</label>
              <input type="password" value={passwordData.confirmPassword} onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})} style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1" }} />
            </div>

            <button onClick={handleChangePassword} style={{ width: "100%", padding: '12px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
              Update Password
            </button>
          </div>
        )}

      </div>
    </div>
  );
}