"use client";

import Link from "next/link";
import { usePathname } from "next/navigation"; 
import { useEffect, useState } from "react";

type User = {
  username: string;
  email: string;
  role: string;
};

export default function Navbar() {
  const pathname = usePathname();
  
  const [user, setUser] = useState<User | null>(null);
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    try {
      const stored = localStorage.getItem("user");
      if (stored) {
        setUser(JSON.parse(stored));
      }
    } catch (error) {
      console.error("Failed to parse user", error);
    }

    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const logout = () => {
    localStorage.removeItem("user");
    setUser(null);
    window.location.href = "/";
  };

  const isActive = (path: string) => pathname === path;

  if (!mounted) return <nav style={{ height: "70px", background: "#0f172a" }}></nav>;

  return (
    <nav style={{ 
      position: "sticky", 
      top: 0, 
      zIndex: 1000,
      display: "flex", 
      justifyContent: "space-between", 
      alignItems: "center", 
      padding: "15px 40px",
      /* ✅ THE MIDNIGHT GLASS EFFECT */
      background: scrolled ? "rgba(15, 23, 42, 0.95)" : "linear-gradient(90deg, #0f172a 0%, #1e293b 100%)",
      backdropFilter: scrolled ? "blur(12px)" : "none",
      borderBottom: scrolled ? "1px solid rgba(255, 255, 255, 0.1)" : "1px solid transparent",
      boxShadow: scrolled ? "0 10px 30px rgba(0,0,0,0.2)" : "none",
      transition: "all 0.3s ease",
      fontFamily: "'Inter', sans-serif"
    }}>
      
      {/* 1. LOGO */}
      <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "10px" }}>
        <span style={{ fontSize: "26px" }}>✈️</span>
        <h2 style={{ 
          margin: 0, 
          fontSize: "24px", 
          fontWeight: "900", 
          letterSpacing: "-0.5px",
          background: "linear-gradient(90deg, #38bdf8, #818cf8)",
          WebkitBackgroundClip: "text",
          backgroundClip: "text", /* ✅ Standard property added */
          WebkitTextFillColor: "transparent",
          color: "transparent", /* ✅ Fallback added */
          display: "inline-block" /* ✅ Prevents the blocky rendering */
        }}>
          TripManager
        </h2>
      </Link>

      {/* 2. NAV LINKS */}
      <div style={{ display: "flex", gap: "30px", alignItems: "center" }}>
        
        <Link href="/" style={{ 
          textDecoration: "none", 
          color: isActive("/") ? "#38bdf8" : "#94a3b8", 
          fontWeight: "700", 
          fontSize: "15px",
          transition: "color 0.2s",
          borderBottom: isActive("/") ? "2px solid #38bdf8" : "2px solid transparent",
          paddingBottom: "4px"
        }} onMouseOver={(e) => { if (!isActive("/")) e.currentTarget.style.color = "white" }} onMouseOut={(e) => { if (!isActive("/")) e.currentTarget.style.color = "#94a3b8" }}>
          Home
        </Link>
        
        <Link href="/packages" style={{ 
          textDecoration: "none", 
          color: isActive("/packages") ? "#38bdf8" : "#94a3b8", 
          fontWeight: "700", 
          fontSize: "15px",
          transition: "color 0.2s",
          borderBottom: isActive("/packages") ? "2px solid #38bdf8" : "2px solid transparent",
          paddingBottom: "4px"
        }} onMouseOver={(e) => { if (!isActive("/packages")) e.currentTarget.style.color = "white" }} onMouseOut={(e) => { if (!isActive("/packages")) e.currentTarget.style.color = "#94a3b8" }}>
          Destinations
        </Link>
        
        {user && (
          <Link href="/dashboard" style={{ 
            textDecoration: "none", 
            color: isActive("/dashboard") ? "#38bdf8" : "#94a3b8", 
            fontWeight: "700", 
            fontSize: "15px",
            transition: "color 0.2s",
            borderBottom: isActive("/dashboard") ? "2px solid #38bdf8" : "2px solid transparent",
            paddingBottom: "4px"
          }} onMouseOver={(e) => { if (!isActive("/dashboard")) e.currentTarget.style.color = "white" }} onMouseOut={(e) => { if (!isActive("/dashboard")) e.currentTarget.style.color = "#94a3b8" }}>
            My Bookings
          </Link>
        )}

        {user?.role === "admin" && (
          <Link href="/admin" style={{ 
            textDecoration: "none", 
            color: isActive("/admin") ? "#38bdf8" : "#94a3b8", 
            fontWeight: "700", 
            fontSize: "15px",
            transition: "color 0.2s",
            borderBottom: isActive("/admin") ? "2px solid #38bdf8" : "2px solid transparent",
            paddingBottom: "4px"
          }} onMouseOver={(e) => { if (!isActive("/admin")) e.currentTarget.style.color = "white" }} onMouseOut={(e) => { if (!isActive("/admin")) e.currentTarget.style.color = "#94a3b8" }}>
            Admin Panel
          </Link>
        )}
      </div>

      {/* 3. AUTH & USER PROFILE */}
      <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
        
        {user ? (
          <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
            
            <Link href="/profile" style={{ textDecoration: "none" }} title="View Profile">
              <div style={{
                width: "40px", height: "40px", borderRadius: "50%", background: "rgba(56, 189, 248, 0.1)", 
                color: "#38bdf8", display: "flex", justifyContent: "center", alignItems: "center", 
                fontWeight: "900", fontSize: "16px", cursor: "pointer", border: "2px solid rgba(56, 189, 248, 0.4)",
                transition: "all 0.2s ease"
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "#38bdf8"; e.currentTarget.style.color = "#0f172a"; e.currentTarget.style.transform = "scale(1.05)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(56, 189, 248, 0.1)"; e.currentTarget.style.color = "#38bdf8"; e.currentTarget.style.transform = "scale(1)"; }}
              >
                {user.username.charAt(0).toUpperCase()}
              </div>
            </Link>
            
            <button 
              onClick={logout} 
              style={{ background: "transparent", color: "#fca5a5", border: "1px solid rgba(248, 113, 113, 0.3)", padding: "8px 16px", borderRadius: "8px", cursor: "pointer", fontWeight: "700", fontSize: "14px", transition: "all 0.2s" }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(239, 68, 68, 0.1)"; e.currentTarget.style.borderColor = "#ef4444"; e.currentTarget.style.color = "#ef4444"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = "rgba(248, 113, 113, 0.3)"; e.currentTarget.style.color = "#fca5a5"; }}
            >
              Logout
            </button>
          </div>
        ) : (
          <>
            <Link href="/login" style={{ textDecoration: "none", fontWeight: "700", color: "#e2e8f0", fontSize: "15px", transition: "color 0.2s" }} onMouseOver={(e) => e.currentTarget.style.color = "white"} onMouseOut={(e) => e.currentTarget.style.color = "#e2e8f0"}>
              Log in
            </Link>
            <Link href="/signup" style={{ background: "#2563eb", color: "white", padding: "10px 22px", borderRadius: "100px", textDecoration: "none", fontWeight: "700", fontSize: "15px", transition: "all 0.2s", boxShadow: "0 4px 15px rgba(37, 99, 235, 0.4)" }} onMouseOver={(e) => { e.currentTarget.style.background = "#1d4ed8"; e.currentTarget.style.transform = "translateY(-1px)"; }} onMouseOut={(e) => { e.currentTarget.style.background = "#2563eb"; e.currentTarget.style.transform = "translateY(0)"; }}>
              Sign Up Free
            </Link>
          </>
        )}
      </div>

    </nav>
  );
}