"use client";

import Link from "next/link";
import { usePathname } from "next/navigation"; 
import { useEffect, useState } from "react";
import "@/assets/styles/navbar.css";

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
  
  // 🔥 NEW: State to track if the mobile menu is open or closed
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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

    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // 🔥 NEW: Automatically close the mobile menu when the user clicks a link to change pages
  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  const logout = () => {
    localStorage.removeItem("user");
    setUser(null);
    window.location.href = "/";
  };

  const isActive = (path: string) => pathname === path;

  if (!mounted) return <nav className="navbar-skeleton"></nav>;

  return (
    <nav className={`navbar ${scrolled ? "scrolled" : ""}`}>
      
      {/* ================= HEADER (Always visible) ================= */}
      <div className="navbar-header">
        <Link href="/" className="logo-link">
          <span className="logo-icon">✈️</span>
          <h2 className="logo-text">TripManager</h2>
        </Link>

        {/* The Hamburger Button (Only shows on mobile) */}
        <button 
          className="hamburger-btn" 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? "✖" : "☰"}
        </button>
      </div>

      {/* ================= CONTENT (Collapses on mobile) ================= */}
      <div className={`navbar-content ${isMenuOpen ? "show" : ""}`}>
        
        {/* NAV LINKS */}
        <div className="nav-links">
          <Link href="/" className={`nav-link ${isActive("/") ? "active" : ""}`}>Home</Link>
          <Link href="/packages" className={`nav-link ${isActive("/packages") ? "active" : ""}`}>Destinations</Link>
          {user && <Link href="/dashboard" className={`nav-link ${isActive("/dashboard") ? "active" : ""}`}>My Bookings</Link>}
          {user?.role === "admin" && <Link href="/admin" className={`nav-link ${isActive("/admin") ? "active" : ""}`}>Admin Panel</Link>}
        </div>

        {/* AUTH & USER PROFILE */}
        <div className="auth-buttons">
          {user ? (
            <div className="user-group">
              <Link href="/profile" title="View Profile" style={{ textDecoration: 'none' }}>
                <div className="user-avatar">{user.username.charAt(0).toUpperCase()}</div>
              </Link>
              <button onClick={logout} className="logout-btn">Logout</button>
            </div>
          ) : (
            <>
              <Link href="/login" className="login-link">Log in</Link>
              <Link href="/signup" className="signup-btn">Sign Up Free</Link>
            </>
          )}
        </div>

      </div>
    </nav>
  );
}