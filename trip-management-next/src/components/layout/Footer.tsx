"use client";

import Link from "next/link";
import "@/assets/styles/footer.css"; // Ensure this matches your file path

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        
        {/* BRAND */}
        <div className="footer-brand">
          <h2>TripManager ✈️</h2>
          <p>
            Curated itineraries, premium stays, and unforgettable experiences. 
            Plan your dream trip with absolute confidence.
          </p>
        </div>

        {/* QUICK LINKS */}
        <div>
          <h3 className="footer-heading">Quick Links</h3>
          <div className="footer-links">
            <Link href="/" className="footer-link">Home</Link>
            <Link href="/packages" className="footer-link">Destinations</Link>
            <Link href="/dashboard" className="footer-link">My Bookings</Link>
          </div>
        </div>

        {/* SOCIAL LINKS (Using SVGs) */}
        <div>
          <h3 className="footer-heading">Follow Us</h3>
          <div className="social-links">
            {/* Instagram */}
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="social-icon" aria-label="Instagram">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
              </svg>
            </a>
            
            {/* LinkedIn */}
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="social-icon" aria-label="LinkedIn">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                <rect x="2" y="9" width="4" height="12"></rect>
                <circle cx="4" cy="4" r="2"></circle>
              </svg>
            </a>
            
            {/* Twitter / X */}
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="social-icon" aria-label="Twitter">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path>
              </svg>
            </a>
          </div>
        </div>

      </div>

      <div className="footer-bottom">
        <div>© {new Date().getFullYear()} TripManager. All rights reserved.</div>
      </div>
    </footer>
  );
}