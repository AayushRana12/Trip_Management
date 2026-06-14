"use client"; // <-- ADD THIS LINE

import React from "react";

export default function TermsAndConditions() {
// ... rest of the code stays exactly the same

  return (
    <main style={{ padding: "60px 20px", background: "#f8fafc", minHeight: "100vh", color: "#334155" }}>
      <div style={{ maxWidth: "800px", margin: "0 auto", background: "white", padding: "40px", borderRadius: "16px", boxShadow: "0 10px 25px rgba(0,0,0,0.05)" }}>
        <h1 style={{ fontSize: "32px", fontWeight: "800", color: "#0f172a", marginBottom: "10px" }}>Terms & Conditions</h1>
        <p style={{ color: "#64748b", marginBottom: "30px" }}>Last Updated: June 2026</p>

        <section style={{ marginBottom: "30px" }}>
          <h2 style={{ fontSize: "20px", fontWeight: "700", color: "#1e293b", marginBottom: "10px", borderBottom: "2px solid #e2e8f0", paddingBottom: "5px" }}>1. General Booking Policy</h2>
          <p style={{ lineHeight: "1.6" }}>
            By booking a trip through TripManager, you agree to provide accurate and up-to-date information. A booking is only considered confirmed once full payment has been successfully processed and a confirmation email with a valid transaction ID has been issued.
          </p>
        </section>

        <section style={{ marginBottom: "30px" }}>
          <h2 style={{ fontSize: "20px", fontWeight: "700", color: "#1e293b", marginBottom: "10px", borderBottom: "2px solid #e2e8f0", paddingBottom: "5px" }}>2. Payment Terms</h2>
          <p style={{ lineHeight: "1.6" }}>
            All payments are securely processed through Razorpay. We do not store your credit card or net banking details on our servers. Prices are inclusive of standard taxes unless otherwise stated. Any additional local taxes or resort fees required at the destination are the responsibility of the traveler.
          </p>
        </section>

        <section style={{ marginBottom: "30px" }}>
          <h2 style={{ fontSize: "20px", fontWeight: "700", color: "#1e293b", marginBottom: "10px", borderBottom: "2px solid #e2e8f0", paddingBottom: "5px" }}>3. Cancellation & Refund Policy</h2>
          <p style={{ lineHeight: "1.6" }}>
            We utilize a tiered cancellation policy to ensure fairness:
          </p>
          <ul style={{ lineHeight: "1.6", marginTop: "10px", paddingLeft: "20px" }}>
            <li><strong>30+ Days Before Travel:</strong> 100% Refund</li>
            <li><strong>15 to 29 Days Before Travel:</strong> 50% Refund</li>
            <li><strong>7 to 14 Days Before Travel:</strong> 25% Refund</li>
            <li><strong>Less than 7 Days:</strong> Strictly Non-Refundable</li>
          </ul>
        </section>

        <section style={{ marginBottom: "30px" }}>
          <h2 style={{ fontSize: "20px", fontWeight: "700", color: "#1e293b", marginBottom: "10px", borderBottom: "2px solid #e2e8f0", paddingBottom: "5px" }}>4. Liability Disclaimer</h2>
          <p style={{ lineHeight: "1.6" }}>
            TripManager acts only as an agent for the transportation companies, hotels, and other contractors. We are not liable for any injury, damage, loss, or delay caused by weather, strikes, flight cancellations, or unforeseen circumstances beyond our direct control. International travelers are solely responsible for carrying valid passports and visas.
          </p>
        </section>

        <div style={{ textAlign: "center", marginTop: "40px" }}>
          <button onClick={() => window.close()} style={{ padding: "10px 20px", background: "#cbd5e1", color: "#334155", border: "none", borderRadius: "8px", fontWeight: "bold", cursor: "pointer" }}>
            Close Window
          </button>
        </div>
      </div>
    </main>
  );
}