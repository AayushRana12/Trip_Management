"use client";

import Link from "next/link";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        
        {/* BRAND */}
        <div className="footer-section">
          <h2>TripManager ✈️</h2>
          <p>Plan your dream trips with ease and comfort.</p>
        </div>

        {/* LINKS */}
        <div className="footer-section">
          <h3>Quick Links</h3>
          <Link href="/">Home</Link>
          <Link href="/packages">Packages</Link>
          <Link href="/dashboard">Dashboard</Link>
        </div>

        {/* SUPPORT */}
        <div className="footer-section">
          <h3>Support</h3>
          <Link href="#">Help Center</Link>
          <Link href="#">Privacy Policy</Link>
          <Link href="#">Terms & Conditions</Link>
        </div>

        {/* SOCIAL */}
        <div className="footer-section">
          <h3>Follow Us</h3>
          <p>Instagram | LinkedIn | Twitter</p>
        </div>

      </div>

      <div className="footer-bottom">
        © 2026 TripManager. All rights reserved.
      </div>
    </footer>
  );
}