"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import toast, { Toaster } from "react-hot-toast"; 
import "@/assets/styles/dashboard.css";

// ✅ TYPES
type Booking = {
  id: number;
  package_id: number;
  title: string;
  price: number;
  total_price: number;
  image: string;
  travel_date: string;
  people: number;
  payment_id: string;
  transaction_id: string;
  status: string;
  refund_amount?: number;
  refund_status?: string;
};

type Complaint = {
  id: number;
  message: string;
  status: string;
  created_at: string;
};

function DashboardContent() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("bookings"); 

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  
  // ✅ Updated Filter State
  const [filter, setFilter] = useState("All");

  const [message, setMessage] = useState("");

  // ✅ USER SMART CANCELLATION STATE
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [userActionData, setUserActionData] = useState<{
    id: number;
    message: string;
    buttonText: string;
    buttonColor: string;
  } | null>(null);

  // ✅ REBOOK MODAL STATE
  const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean, type: 'rebook' | null, id: number | null }>({
    isOpen: false,
    type: null,
    id: null
  });

  const user = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("user") || "{}") : {};

  // ✅ HELPER: Check if the date is in the past
  const isPastDate = (travelDate: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to compare only dates
    return new Date(travelDate) < today;
  };

  const fetchData = useCallback(async () => {
    try {
      if (!user.id) return;

      const bookRes = await fetch(`http://localhost:8000/api/bookings/${user.id}`);
      const bookData = await bookRes.json();
      
      const compRes = await fetch(`http://localhost:8000/api/complaints/user/${user.id}`);
      const compData = await compRes.json();

      if (Array.isArray(bookData)) {
        setBookings(bookData.map((b: any) => ({
          ...b,
          // Fallback to ensure we catch the ID whether the DB names it package_id or packageid
          package_id: b.package_id || b.packageid, 
          people: Number(b.people) || 1,
          price: Number(b.price) || 0,
          total_price: Number(b.total_price) || 0,
          refund_amount: Number(b.refund_amount) || 0,
          refund_status: b.refund_status || "",
        })));
      }
      
      if (Array.isArray(compData)) setComplaints(compData);

    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  }, [user.id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ✅ EXECUTE REBOOK ACTION
  const executeRebook = async () => {
    if (!confirmModal.id) return;
    try {
      const res = await fetch(`http://localhost:8000/api/bookings/${confirmModal.id}/rebook`, { method: "PUT" });
      
      if (res.ok) {
        toast.success("Trip Re-booked Successfully! 🎉");
        fetchData(); 
      } else {
        toast.error(`Failed to rebook trip. Check backend.`);
      }
    } catch (err) { 
      toast.error("Network error"); 
    } finally {
      setConfirmModal({ isOpen: false, type: null, id: null });
    }
  };

  // ✅ SMART CANCELLATION CALCULATION
  const cancelMyTrip = (booking: Booking) => {
    const travelDate = new Date(booking.travel_date);
    const today = new Date();
    const hoursDiff = (travelDate.getTime() - today.getTime()) / (1000 * 60 * 60);
    
    let warningMessage = "";
    let color = "";

    if (hoursDiff >= 48) {
      warningMessage = `Good news! This trip is more than 48 hours away. You are eligible for a FULL REFUND of ₹${booking.total_price.toLocaleString()} back to your original payment method.`;
      color = "#16a34a"; // Green
    } else if (hoursDiff > 0) {
      warningMessage = `⚠️ URGENT: Your trip is only ${Math.round(hoursDiff)} hours away. According to our cancellation policy, NO REFUND will be issued if you proceed.`;
      color = "#ea580c"; // Orange
    } else {
      warningMessage = `⚠️ This trip has already started or passed. Cancellation will result in NO REFUND.`;
      color = "#ef4444"; // Red
    }

    setUserActionData({ 
      id: booking.id, 
      message: warningMessage, 
      buttonText: 'Yes, Cancel My Trip', 
      buttonColor: color 
    }); 
    setIsCancelModalOpen(true); 
  };

  // ✅ SUBMIT CANCELLATION TO API
  const confirmCancellation = async () => {
    if (!userActionData) return;
    try {
      const res = await fetch(`http://localhost:8000/api/bookings/${userActionData.id}/cancel`, { method: "PUT" });
      if (res.ok) {
        toast.success("Booking Cancelled ❌");
        setIsCancelModalOpen(false);
        fetchData();
      } else {
        toast.error("Failed to cancel booking.");
      }
    } catch (error) {
      toast.error("Network error while cancelling.");
    }
  };

  // ✅ AI AGENT LISTENER
  useEffect(() => {
    const handleAiCancel = (e: any) => {
      const targetId = e.detail.bookingId;
      
      // Find the trip the AI is talking about
      const tripToCancel = bookings.find(b => b.id === targetId);
      
      if (tripToCancel) {
        // Trigger your existing cancel logic!
        cancelMyTrip(tripToCancel);
      } else {
        toast.error("AI tried to cancel a trip that doesn't exist on this page.");
      }
    };

    // Listen for the AI's secret signal
    window.addEventListener("ai_trigger_cancel", handleAiCancel);
    
    return () => window.removeEventListener("ai_trigger_cancel", handleAiCancel);
  }, [bookings]);

  const handleCreateComplaint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return toast.error("Please enter your complaint message.");

    try {
      const res = await fetch("http://localhost:8000/api/complaints", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: user.id, message })
      });
      
      if (res.ok) {
        toast.success("Complaint submitted! We will look into it.");
        setMessage(""); 
        fetchData(); 
      } else {
        toast.error("Failed to submit complaint");
      }
    } catch (err) {
      toast.error("Network error");
    }
  };

  // ✅ Use strict filter logic
  const displayedBookings = bookings.filter(b => {
    if (filter === "Confirmed") return b.status.toLowerCase() === "confirmed";
    if (filter === "Cancelled") return b.status.toLowerCase() === "cancelled";
    return true; // "All"
  });

  const formatDate = (dateStr: string) => dateStr ? new Date(dateStr).toLocaleDateString("en-IN") : "N/A";
  
  const navBtnStyle = (tab: string) => ({
    padding: "12px 24px", borderRadius: "8px", border: "none", fontSize: "16px", fontWeight: "bold" as const, cursor: "pointer", transition: "all 0.2s ease",
    background: activeTab === tab ? "#1e293b" : "transparent",
    color: activeTab === tab ? "white" : "#64748b",
  });

  const filterBtnStyle = (currentFilter: string) => ({
    padding: "8px 16px", borderRadius: "20px", border: "1px solid #e2e8f0", cursor: "pointer", fontWeight: "bold" as const, transition: "all 0.2s ease",
    background: filter === currentFilter ? "#3b82f6" : "white",
    color: filter === currentFilter ? "white" : "#64748b",
  });

  if (loading) return <section className="dashboard" style={{ padding: "40px", textAlign: "center" }}><p>Loading your dashboard...</p></section>;

  return (
    <section className="dashboard" style={{ padding: "40px", maxWidth: "1200px", margin: "0 auto", fontFamily: "sans-serif" }}>
      <Toaster position="top-center" />

      {/* TABS NAVIGATION */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "30px", borderBottom: "2px solid #e2e8f0", paddingBottom: "10px" }}>
        <button onClick={() => setActiveTab("bookings")} style={navBtnStyle("bookings")}>🎫 My Bookings</button>
        <button onClick={() => setActiveTab("complaints")} style={navBtnStyle("complaints")}>🎧 Support & Complaints</button>
      </div>

      {activeTab === "bookings" && (
        <>
          <div className="filter-buttons" style={{ marginBottom: "30px", display: "flex", gap: "10px" }}>
            <button onClick={() => setFilter("All")} style={filterBtnStyle("All")}>All Bookings</button>
            <button onClick={() => setFilter("Confirmed")} style={filterBtnStyle("Confirmed")}>✅ Confirmed</button>
            <button onClick={() => setFilter("Cancelled")} style={filterBtnStyle("Cancelled")}>❌ Cancelled</button>
          </div>

          {bookings.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px", background: "#f8fafc", borderRadius: "12px", border: "1px dashed #cbd5e1" }}>
              <p style={{ fontSize: "40px", margin: "0 0 10px 0" }}>😢</p>
              <h3 style={{ color: "#1e293b", marginBottom: "10px" }}>No bookings yet</h3>
            </div>
          ) : displayedBookings.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px", background: "#f8fafc", borderRadius: "12px", border: "1px dashed #cbd5e1" }}>
              <h3 style={{ color: "#1e293b" }}>No {filter.toLowerCase()} bookings found.</h3>
            </div>
          ) : (
            <div className="dashboard-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "25px" }}>
              {displayedBookings.map((b) => (
                <div key={b.id} style={{ background: "white", borderRadius: "16px", overflow: "hidden", boxShadow: "0 4px 15px rgba(0,0,0,0.05)", border: "1px solid #e2e8f0", display: "flex", flexDirection: "column" }}>
                  <img src={b.image} alt={b.title} style={{ width: "100%", height: "200px", objectFit: "cover", filter: b.status.toLowerCase() === "cancelled" ? "grayscale(80%)" : "none" }} />
                  <div style={{ padding: "24px", display: "flex", flexDirection: "column", flexGrow: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "15px", gap: "10px" }}>
                      <h3 style={{ margin: 0, fontSize: "20px", color: "#1e293b", fontWeight: "800", lineHeight: "1.3" }}>{b.title}</h3>
                      <span style={{ padding: "6px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: "bold", whiteSpace: "nowrap", backgroundColor: b.status.toLowerCase() === 'confirmed' ? "#dcfce7" : "#fee2e2", color: b.status.toLowerCase() === 'confirmed' ? "#166534" : "#991b1b" }}>
                        {b.status.toLowerCase() === 'confirmed' ? '✅ Confirmed' : '❌ Cancelled'}
                      </span>
                    </div>
                    
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "20px", fontSize: "14px", color: "#475569" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}><span style={{ fontSize: "16px" }}>📅</span> <strong>{formatDate(b.travel_date)}</strong></div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}><span style={{ fontSize: "16px" }}>👥</span> <strong>{b.people} People</strong></div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", gridColumn: "span 2" }}><span style={{ fontSize: "16px" }}>💰</span> <strong style={{ color: b.status.toLowerCase() === "cancelled" ? "#94a3b8" : "#16a34a", fontSize: "18px" }}>₹{b.total_price.toLocaleString()}</strong></div>
                    </div>

                    <div style={{ background: "#f8fafc", padding: "12px", borderRadius: "8px", fontSize: "12px", color: "#64748b", marginBottom: "20px", border: "1px dashed #cbd5e1" }}>
                      <div style={{ marginBottom: "8px", wordBreak: "break-all" }}><strong>Payment ID:</strong> <br/>{b.payment_id || "N/A"}</div>
                      <div style={{ wordBreak: "break-all" }}><strong>Transaction ID:</strong> <br/>{b.transaction_id || "N/A"}</div>
                    </div>

                    <div style={{ flexGrow: 1 }}></div>
                    
                    {/* ✅ DYNAMIC CANCELLATION AREA */}
                    <div style={{ marginTop: "15px" }}>
                      {b.status.toLowerCase() === 'cancelled' ? (
                        <>
                          {/* Show the Refund Status */}
                          <div style={{ padding: "10px", background: "#f8fafc", borderRadius: "8px", border: "1px solid #e2e8f0", marginBottom: "10px" }}>
                            <p style={{ fontSize: "13px", color: "#64748b", margin: "0 0 5px 0" }}>Refund Status:</p>
                            <p style={{ fontSize: "14px", fontWeight: "bold", color: (b.refund_amount && b.refund_amount > 0) ? "#16a34a" : "#ea580c", margin: 0 }}>
                              {b.refund_status || "Processed"} 
                              {b.refund_amount && b.refund_amount > 0 ? ` (₹${Number(b.refund_amount).toLocaleString()})` : ""}
                            </p>
                          </div>

                          {/* The Rebook Button (Forces New Payment Flow) */}
                          <button 
                            onClick={() => router.push(`/packages/${b.package_id}`)}
                            style={{ 
                              width: "100%", padding: "12px", background: "#2563eb", 
                              color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "bold" 
                            }}
                          >
                            Rebook & Pay Again 🔄
                          </button>
                        </>
                      ) : !isPastDate(b.travel_date) ? (
                        <button 
                          onClick={() => cancelMyTrip(b)}
                          style={{ 
                            width: "100%", padding: "12px", background: "#fee2e2", 
                            color: "#991b1b", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "bold", transition: "0.2s" 
                          }}
                          onMouseOver={(e) => e.currentTarget.style.background = "#fca5a5"}
                          onMouseOut={(e) => e.currentTarget.style.background = "#fee2e2"}
                        >
                          Cancel Booking
                        </button>
                      ) : (
                        <div style={{ width: "100%", padding: "12px", background: "#fee2e2", color: "#991b1b", borderRadius: "8px", textAlign: "center", fontWeight: "bold", border: "1px solid #fca5a5", fontSize: "14px" }}>
                          Trip Passed
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* COMPLAINTS TAB SECTION */}
      {activeTab === "complaints" && (
        <div style={{ display: "flex", gap: "30px", alignItems: "flex-start", flexWrap: "wrap" }}>
          {/* New Complaint Form */}
          <div style={{ flex: "1 1 400px", background: "white", padding: "30px", borderRadius: "12px", boxShadow: "0 4px 15px rgba(0,0,0,0.05)", border: "1px solid #e2e8f0" }}>
            <h3 style={{ marginTop: 0, color: "#1e293b", marginBottom: "20px" }}>Need Help?</h3>
            <form onSubmit={handleCreateComplaint} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
              <div>
                <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold", color: "#475569", fontSize: "14px" }}>Your Message / Complaint</label>
                <textarea 
                  value={message} 
                  onChange={(e) => setMessage(e.target.value)} 
                  placeholder="Please describe your issue in detail..." 
                  style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #cbd5e1", minHeight: "150px", fontSize: "15px", resize: "vertical" }} 
                  required 
                />
              </div>
              <button type="submit" style={{ padding: "12px", background: "#3b82f6", color: "white", border: "none", borderRadius: "8px", fontWeight: "bold", fontSize: "15px", cursor: "pointer" }}>
                Submit to Support
              </button>
            </form>
          </div>

          {/* Support History */}
          <div style={{ flex: "2 1 500px", background: "white", padding: "30px", borderRadius: "12px", boxShadow: "0 4px 15px rgba(0,0,0,0.05)", border: "1px solid #e2e8f0" }}>
            <h3 style={{ marginTop: 0, color: "#1e293b", marginBottom: "20px" }}>Your Support History</h3>
            {complaints.length === 0 ? (
              <div style={{ textAlign: "center", padding: "30px", background: "#f8fafc", borderRadius: "8px", border: "1px dashed #cbd5e1" }}>
                <span style={{ fontSize: "30px" }}>🎉</span>
                <p style={{ color: "#64748b", margin: "10px 0 0 0" }}>No complaints found.</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                {complaints.map(c => (
                  <div key={c.id} style={{ padding: "20px", borderRadius: "8px", border: "1px solid #e2e8f0", background: "#f8fafc", display: "flex", flexDirection: "column", gap: "10px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <small style={{ color: "#94a3b8", fontWeight: "bold" }}>TICKET #{c.id}</small>
                      <span style={{ 
                        padding: "4px 10px", borderRadius: "12px", fontSize: "11px", fontWeight: "bold", textTransform: "uppercase",
                        background: c.status === "resolved" ? "#dcfce7" : "#fef3c7",
                        color: c.status === "resolved" ? "#166534" : "#b45309"
                      }}>
                        {c.status}
                      </span>
                    </div>
                    <p style={{ margin: 0, color: "#334155", fontSize: "15px", lineHeight: "1.6" }}>{c.message}</p>
                    <small style={{ color: "#94a3b8", alignSelf: "flex-end" }}>{new Date(c.created_at).toLocaleDateString()}</small>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ✅ USER CANCELLATION MODAL */}
      {isCancelModalOpen && userActionData && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 3000 }}>
          <div style={{ background: 'white', padding: '30px', borderRadius: '12px', width: '400px', textAlign: 'center' }}>
            <span style={{ fontSize: '40px' }}>⚠️</span>
            <h3 style={{ margin: '15px 0' }}>Cancel Trip?</h3>
            <p style={{ color: "#475569", marginBottom: "20px", fontSize: "15px", lineHeight: "1.5" }}>{userActionData.message}</p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                onClick={confirmCancellation} 
                style={{ flex: 1, padding: '12px', background: userActionData.buttonColor, color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
              >
                {userActionData.buttonText}
              </button>
              <button onClick={() => setIsCancelModalOpen(false)} style={{ flex: 1, padding: '12px', background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                Keep My Trip
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ✅ REBOOK MODAL FOR CONFIRMATION */}
      {confirmModal.isOpen && confirmModal.type === 'rebook' && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 3000 }}>
          <div className="modal-box" style={{ background: 'white', padding: '30px', borderRadius: '16px', width: '350px', textAlign: 'center', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
            <span style={{ fontSize: '45px' }}>♻️</span>
            <h3 style={{ margin: '15px 0', color: '#1e293b', fontSize: "22px" }}>
              Rebook Trip?
            </h3>
            <p style={{ color: '#64748b', fontSize: '15px', marginBottom: '25px', lineHeight: "1.5" }}>
              Do you want to re-confirm and book this trip again?
            </p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                onClick={executeRebook} 
                style={{ flex: 1, padding: '12px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
              >
                Yes, Rebook
              </button>
              <button 
                onClick={() => setConfirmModal({ isOpen: false, type: null, id: null })} 
                style={{ flex: 1, padding: '12px', background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}