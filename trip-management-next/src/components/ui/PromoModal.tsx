"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";

export default function PromoModal() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Check if the user has already seen the popup this session
    const hasSeenPromo = sessionStorage.getItem("hasSeenPromo");
    
    if (!hasSeenPromo) {
      // Wait 3 seconds before popping up
      const timer = setTimeout(() => {
        setIsOpen(true);
        sessionStorage.setItem("hasSeenPromo", "true"); // Mark as seen
      }, 3000); 
      
      return () => clearTimeout(timer);
    }
  }, []);

  const copyCode = () => {
    navigator.clipboard.writeText("TRIP10");
    toast.success("Discount code TRIP10 copied!");
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.6)", zIndex: 9999, display: "flex", justifyContent: "center", alignItems: "center", padding: "20px" }}>
      <div style={{ background: "white", width: "100%", maxWidth: "450px", borderRadius: "20px", overflow: "hidden", boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)", position: "relative", animation: "slideUp 0.4s ease-out" }}>
        
        {/* Close Button */}
        <button onClick={() => setIsOpen(false)} style={{ position: "absolute", top: "15px", right: "15px", background: "rgba(255,255,255,0.8)", border: "none", borderRadius: "50%", width: "32px", height: "32px", fontSize: "16px", cursor: "pointer", fontWeight: "bold", color: "#334155", zIndex: 10 }}>
          ✕
        </button>

        {/* Header Image Area */}
        <div style={{ background: "linear-gradient(135deg, #2563eb, #3b82f6)", padding: "40px 20px", textAlign: "center", color: "white" }}>
          <span style={{ fontSize: "40px", display: "block", marginBottom: "10px" }}>✈️</span>
          <h2 style={{ margin: 0, fontSize: "28px", fontWeight: "900" }}>Special Offer!</h2>
          <p style={{ margin: "5px 0 0 0", opacity: 0.9, fontSize: "16px" }}>Book your dream vacation today.</p>
        </div>

        {/* Content Area */}
        <div style={{ padding: "30px", textAlign: "center" }}>
          <p style={{ fontSize: "18px", color: "#334155", margin: "0 0 20px 0" }}>
            Get an instant <strong style={{ color: "#16a34a", fontSize: "22px" }}>10% OFF</strong> your next trip booking!
          </p>
          
          <div style={{ background: "#f1f5f9", border: "2px dashed #94a3b8", padding: "15px", borderRadius: "12px", fontSize: "24px", fontWeight: "900", color: "#0f172a", letterSpacing: "2px", marginBottom: "20px" }}>
            TRIP10
          </div>

          <button onClick={copyCode} style={{ width: "100%", padding: "16px", background: "#2563eb", color: "white", border: "none", borderRadius: "10px", fontSize: "16px", fontWeight: "800", cursor: "pointer", transition: "0.2s" }}>
            Copy Code & Claim Offer
          </button>
          
          <button onClick={() => setIsOpen(false)} style={{ background: "none", border: "none", color: "#94a3b8", textDecoration: "underline", marginTop: "15px", cursor: "pointer", fontSize: "14px" }}>
            No thanks, I prefer paying full price
          </button>
        </div>
      </div>
      
      {/* Simple animation injected directly */}
      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}