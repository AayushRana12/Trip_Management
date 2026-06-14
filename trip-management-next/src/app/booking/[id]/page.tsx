"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, ChangeEvent } from "react";
import toast, { Toaster } from "react-hot-toast";
import "@/assets/styles/booking.css";
import { API_BASE_URL } from "@/config";

type Vehicle = {
  id: number;
  name: string;
  price_per_day: number;
  image: string;
};

export default function BookingPage() {
  const { id } = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlDate = searchParams.get("date");

  const [user, setUser] = useState<any>({});
  const [pkg, setPkg] = useState<any>(null);

  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [date, setDate] = useState("");

  const [availability, setAvailability] = useState<{ max_capacity: number, booked_dates: any[] } | null>(null);
  const [seatsLeft, setSeatsLeft] = useState<number | null>(null);

  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [price, setPrice] = useState(0);

  const [mealPreference, setMealPreference] = useState("Veg");

  // Transfer State
  const [transferOption, setTransferOption] = useState("none");
  const [arrivalPoint, setArrivalPoint] = useState("");
  const [arrivalTime, setArrivalTime] = useState("");

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);

  // File Upload State
  const [idProof, setIdProof] = useState<File | null>(null);
  const [idProofUrl, setIdProofUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const [showPayment, setShowPayment] = useState(false);
  const [loading, setLoading] = useState(false);

  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const isInternational = pkg?.is_international || false;

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
    setUser(storedUser);
  }, []);

  useEffect(() => {
    if (!id) return;

    fetch(`${API_BASE_URL}/api/packages/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch package");
        return res.json();
      })
      .then((data) => {
        setPkg(data);
        setPrice(data.discounted_price ? Number(data.discounted_price) : Number(data.price));

        if (data.departure_dates && Array.isArray(data.departure_dates) && data.departure_dates.length > 0) {
          const today = new Date().toISOString().split("T")[0];
          const validFutureDates = data.departure_dates.filter((d: string) => d >= today);
          const sortedDates = validFutureDates.sort();

          setAvailableDates(sortedDates);
          if (sortedDates.length > 0) {
            if (urlDate && sortedDates.includes(urlDate)) {
              setDate(urlDate);
            } else {
              setDate(sortedDates[0]);
            }
          } else {
            setDate("");
          }
        }
      })
      .catch((err) => {
        console.error("Fetch error:", err);
        toast.error("Failed to load trip details.");
      });

    fetch(`${API_BASE_URL}/api/packages/${id}/availability`)
      .then(res => res.json())
      .then(data => setAvailability(data))
      .catch(err => console.error("Failed to fetch availability", err));

  }, [id, urlDate]);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/vehicles`)
      .then(res => res.json())
      .then(data => setVehicles(data))
      .catch(err => console.error("Failed to fetch vehicles", err));
  }, []);

  useEffect(() => {
    if (date && availability) {
      const normalizedDate = date.split('T')[0];
      const dateRecord = availability.booked_dates.find((d: any) => d.date === normalizedDate);
      const alreadyBooked = dateRecord ? dateRecord.booked : 0;
      setSeatsLeft(availability.max_capacity - alreadyBooked);
    } else {
      setSeatsLeft(null);
    }
  }, [date, availability]);

  const totalPeople = adults + children;
  const adultsCost = price * adults;
  const childrenCost = Math.round((price * 0.9) * children);
  const baseCost = adultsCost + childrenCost;
  const vehicleCost = selectedVehicle ? selectedVehicle.price_per_day : 0;
  const totalPrice = baseCost + vehicleCost;

  const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setIdProof(file);
      setIsUploading(true);

      const formData = new FormData();
      formData.append("document", file);

      try {
        const res = await fetch(`${API_BASE_URL}/api/upload`, {
          method: "POST",
          body: formData,
        });
        const data = await res.json();

        if (data.url) {
          setIdProofUrl(data.url);
          toast.success("Document uploaded securely.");
        } else {
          toast.error("Upload failed on server.");
          setIdProof(null);
        }
      } catch (err) {
        console.error(err);
        toast.error("Network error during upload.");
        setIdProof(null);
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleProceed = () => {
    if (!idProofUrl) {
      toast.error(
        isUploading
          ? "Please wait for the document to finish uploading..."
          : isInternational
            ? "Travel Requirement: Passport is mandatory for international trips."
            : "Travel Requirement: Please upload a Govt. ID for hotel check-in."
      );
      return;
    }

    if (transferOption !== "none" && (!arrivalPoint || !arrivalTime)) {
      toast.error("Please provide arrival point and time for your transfer.");
      return;
    }

    if (!date || totalPeople === 0) {
      toast.error("Please select a travel date and at least 1 person.");
      return;
    }

    if (!user || !user.id) {
      toast.error("Session expired. Please log in again.");
      router.push("/login");
      return;
    }
    setShowPayment(true);
  };

  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (document.getElementById("razorpay-script")) return resolve(true);
      const script = document.createElement("script");
      script.id = "razorpay-script";
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    setLoading(true);

    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        toast.error("Failed to load Razorpay. Check your internet.");
        setLoading(false);
        return;
      }

      const orderRes = await fetch(`${API_BASE_URL}/api/payment/create-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: totalPrice }),
      });
      const orderData = await orderRes.json();

      if (!orderData.success) {
        toast.error("Could not create payment order. Try again.");
        setLoading(false);
        return;
      }

      const options = {
        key: "rzp_test_SfKwgt4lOI7Vte",
        amount: orderData.order.amount,
        currency: "INR",
        name: "Trip Management",
        description: pkg?.title || "Trip Booking",
        order_id: orderData.order.id,

        handler: async function (response: any) {
          const verifyRes = await fetch(`${API_BASE_URL}/api/payment/verify`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              user_id: user.id,
              package_id: id,
              travel_date: date,
              people: totalPeople,
              adults: adults,
              children: children,
              meal_preference: mealPreference,
              transfer_option: transferOption,
              arrival_point: arrivalPoint,
              arrival_time: arrivalTime,
              id_proof_url: idProofUrl,
            }),
          });

          const verifyData = await verifyRes.json();

          if (verifyData.success) {
            toast.success("Payment Successful! 🎉 Redirecting...");
            setTimeout(() => router.push("/dashboard"), 2000);
          } else {
            toast.error(verifyData.error || "Payment verification failed. Contact support.");
            setLoading(false);
          }
        },

        prefill: {
          name: user?.username ? user.username : "Test User",
          email: user?.email ? user.email : "test@example.com",
          contact: user?.phone ? user.phone : "9876543210",
        },
        theme: { color: "#2563eb" },

        modal: {
          ondismiss: function () {
            toast.error("Payment cancelled.");
            setLoading(false);
          },
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on("payment.failed", function (response: any) {
        toast.error("Payment failed: " + response.error.description);
        setLoading(false);
      });
      rzp.open();

    } catch (err: any) {
      console.error(err);
      toast.error(`Something went wrong: ${err.message}`);
      setLoading(false);
    }
  };

  if (!pkg) return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", color: "#64748b", fontWeight: "600", fontSize: "18px", background: "#f8fafc" }}>
      Preparing Checkout...
    </div>
  );

  return (
    <main className="booking-container" style={{ background: "#f8fafc", minHeight: "100vh", padding: "60px 20px" }}>
      <Toaster position="top-center" />
      <style>{`
        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.5; }
          100% { opacity: 1; }
        }
      `}</style>
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>

        <button onClick={() => router.back()} style={{ background: "transparent", border: "none", color: "#64748b", fontWeight: "bold", cursor: "pointer", marginBottom: "30px", fontSize: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
          ← Back to details
        </button>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1.4fr", gap: "40px", alignItems: "start" }}>

          {/* LEFT SIDE: TRIP SUMMARY */}
          <div style={{ background: "white", borderRadius: "24px", overflow: "hidden", boxShadow: "0 10px 25px rgba(0,0,0,0.05)", border: "1px solid #e2e8f0", position: "sticky", top: "40px" }}>
            <img src={pkg.image} alt={pkg.title} style={{ width: "100%", height: "250px", objectFit: "cover" }} />
            <div style={{ padding: "30px" }}>
              <h2 style={{ margin: "0 0 10px 0", fontSize: "24px", color: "#0f172a", fontWeight: "800" }}>{pkg.title}</h2>
              {pkg.duration_days && <p style={{ margin: 0, color: "#64748b", fontWeight: "600" }}>⏱️ {pkg.duration_days}</p>}

              <hr style={{ border: "none", borderTop: "1px dashed #cbd5e1", margin: "20px 0" }} />

              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "15px", color: "#475569", fontSize: "15px", fontWeight: "500" }}>
                <span>Base Price</span>
                <strong>₹{price.toLocaleString()}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "15px", color: "#475569", fontSize: "15px", fontWeight: "500" }}>
                <span>Adults (x{adults})</span>
                <strong>₹{adultsCost.toLocaleString()}</strong>
              </div>

              {children > 0 && (
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "15px", color: "#10b981", fontSize: "15px", fontWeight: "600" }}>
                  <span>Children 10% Off (x{children})</span>
                  <strong>+ ₹{childrenCost.toLocaleString()}</strong>
                </div>
              )}

              {transferOption !== "none" && (
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "15px", color: "#0ea5e9", fontWeight: "bold" }}>
                  <span>🚗 Last-Mile Transfer</span>
                  <strong>{transferOption === "arrival" ? "Arrival Only" : "Round Trip"}</strong>
                </div>
              )}

              <hr style={{ border: "none", borderTop: "2px dashed #e2e8f0", margin: "20px 0" }} />

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "18px", fontWeight: "800", color: "#0f172a" }}>Total Due</span>
                <span style={{ fontSize: "32px", fontWeight: "900", color: "#2563eb", letterSpacing: "-1px" }}>₹{totalPrice.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE: BOOKING FORM */}
          <div style={{ background: "white", padding: "40px", borderRadius: "24px", boxShadow: "0 10px 25px rgba(0,0,0,0.05)", border: "1px solid #e2e8f0" }}>
            <h1 style={{ margin: "0 0 10px 0", fontSize: "32px", color: "#0f172a", fontWeight: "800", letterSpacing: "-1px" }}>Complete Booking</h1>
            <p style={{ color: "#64748b", marginBottom: "40px", fontSize: "15px" }}>Booking for <strong>{user.username || "Guest"}</strong> ({user.email || "No email provided"}).</p>

            <div style={{ display: "flex", flexDirection: "column", gap: "30px" }}>

              {/* DEPARTURE DATE DROPDOWN */}
              <div>
                <label style={{ display: "block", marginBottom: "10px", fontWeight: "700", color: "#1e293b", fontSize: "15px" }}>
                  Select Departure Date
                </label>

                {availableDates.length > 0 ? (
                  <>
                    <select
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      disabled={showPayment}
                      style={{ width: "100%", padding: "16px", borderRadius: "12px", border: "2px solid #e2e8f0", fontSize: "16px", color: "#334155", outline: "none", cursor: showPayment ? "not-allowed" : "pointer", opacity: showPayment ? 0.6 : 1, fontWeight: "bold", background: "#f8fafc" }}
                    >
                      {availableDates.map(d => (
                        <option key={d} value={d}>
                          {new Date(d).toLocaleDateString("en-IN", { weekday: 'short', year: 'numeric', month: 'long', day: 'numeric' })}
                        </option>
                      ))}
                    </select>

                    {date && seatsLeft !== null && (
                      <div style={{ marginTop: "12px", padding: "12px 16px", borderRadius: "12px", backgroundColor: seatsLeft < totalPeople ? "#fef2f2" : seatsLeft <= 15 ? "#fffbeb" : "#f0fdf4", border: `1px solid ${seatsLeft < totalPeople ? "#fca5a5" : seatsLeft <= 15 ? "#fcd34d" : "#bbf7d0"}` }}>
                        {seatsLeft === 0 ? (
                          <span style={{ color: "#ef4444", fontWeight: "bold" }}>❌ Sold Out for this date!</span>
                        ) : seatsLeft < totalPeople ? (
                          <span style={{ color: "#dc2626", fontWeight: "bold" }}>⚠️ Only {seatsLeft} seats left! Reduce your group size.</span>
                        ) : (
                          <span style={{ color: "#16a34a", fontWeight: "bold" }}>✅ {seatsLeft} seats available.</span>
                        )}
                      </div>
                    )}
                  </>
                ) : (
                  <div style={{ padding: "16px", background: "#fee2e2", color: "#991b1b", borderRadius: "12px", fontWeight: "bold", textAlign: "center", border: "1px solid #fca5a5" }}>
                    Sold Out / No Future Dates Available
                  </div>
                )}
              </div>

              {/* Adults & Children Grid */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                <div>
                  <label style={{ display: "block", marginBottom: "10px", fontWeight: "700", color: "#1e293b", fontSize: "15px" }}>Adults</label>
                  <select value={adults} onChange={(e) => setAdults(Number(e.target.value))} disabled={showPayment} style={{ width: "100%", padding: "16px", borderRadius: "12px", border: "2px solid #e2e8f0", fontSize: "16px", color: "#334155", outline: "none", opacity: showPayment ? 0.6 : 1, background: "#f8fafc" }}>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => <option key={num} value={num}>{num}</option>)}
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", marginBottom: "10px", fontWeight: "700", color: "#1e293b", fontSize: "15px" }}>Children (Under 12)</label>
                  <select value={children} onChange={(e) => setChildren(Number(e.target.value))} disabled={showPayment} style={{ width: "100%", padding: "16px", borderRadius: "12px", border: "2px solid #e2e8f0", fontSize: "16px", color: "#334155", outline: "none", opacity: showPayment ? 0.6 : 1, background: "#f8fafc" }}>
                    {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => <option key={num} value={num}>{num}</option>)}
                  </select>
                </div>
              </div>

              {/* MEAL PREFERENCE */}
              <div>
                <label style={{ display: "block", marginBottom: "10px", fontWeight: "700", color: "#1e293b", fontSize: "15px" }}>
                  Meal Preference
                </label>
                <select
                  value={mealPreference}
                  onChange={(e) => setMealPreference(e.target.value)}
                  disabled={showPayment}
                  style={{ width: "100%", padding: "16px", borderRadius: "12px", border: "2px solid #e2e8f0", fontSize: "16px", color: "#334155", outline: "none", opacity: showPayment ? 0.6 : 1, cursor: showPayment ? "not-allowed" : "pointer", background: "#f8fafc" }}
                >
                  <option value="Veg">🥦 Pure Vegetarian</option>
                  <option value="Non-Veg">🍗 Non-Vegetarian</option>
                  <option value="Jain">🥗 Jain Food (No Onion/Garlic)</option>
                  <option value="Any">🍽️ No Specific Preference</option>
                </select>
              </div>

              {/* LAST-MILE TRANSFERS */}
              <div className="booking-section">
                <h3 className="section-title" style={{ display: "block", marginBottom: "15px", fontWeight: "700", color: "#1e293b", fontSize: "16px" }}>Last-Mile Transfers (Optional)</h3>

                <div className="transfer-options-grid" style={{ pointerEvents: showPayment ? "none" : "auto", opacity: showPayment ? 0.6 : 1 }}>
                  <div
                    className={`transfer-card ${transferOption === "none" ? "selected" : ""}`}
                    onClick={() => setTransferOption("none")}
                  >
                    <span className="transfer-icon">🚶‍♂️</span>
                    <h4>No Transfers</h4>
                    <p>I'll reach the hotel myself</p>
                  </div>

                  <div
                    className={`transfer-card ${transferOption === "arrival" ? "selected" : ""}`}
                    onClick={() => setTransferOption("arrival")}
                  >
                    <span className="transfer-icon">🛬</span>
                    <h4>Arrival Pickup</h4>
                    <p>Airport/Station to Hotel on Day 1</p>
                  </div>

                  <div
                    className={`transfer-card ${transferOption === "round_trip" ? "selected" : ""}`}
                    onClick={() => setTransferOption("round_trip")}
                  >
                    <span className="transfer-icon">🚕</span>
                    <h4>Round-Trip Transfers</h4>
                    <p>Pickup on arrival & Drop-off on departure</p>
                  </div>
                </div>

                {transferOption !== "none" && (
                  <div className="transfer-details-container" style={{ marginTop: "20px", padding: "20px", background: "#f1f5f9", borderRadius: "12px" }}>
                    <p className="transfer-reminder" style={{ fontSize: "14px", color: "#475569", marginBottom: "15px" }}>
                      📅 Transport will be automatically scheduled based on your trip dates.
                    </p>

                    <div className="input-group" style={{ marginBottom: "15px" }}>
                      <label style={{ display: "block", fontSize: "14px", fontWeight: "bold", marginBottom: "8px" }}>Arrival Point (Airport or Train Station) *</label>
                      <input
                        type="text"
                        placeholder="e.g., Airport Name  or Railway Station Name"
                        value={arrivalPoint}
                        onChange={(e) => setArrivalPoint(e.target.value)}
                        required
                        disabled={showPayment}
                        style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #cbd5e1" }}
                      />
                    </div>

                    <div className="input-group">
                      <label style={{ display: "block", fontSize: "14px", fontWeight: "bold", marginBottom: "8px" }}>Arrival Time / Flight Number *</label>
                      <input
                        type="text"
                        placeholder="e.g., 14:30 / Indigo 6E-214"
                        value={arrivalTime}
                        onChange={(e) => setArrivalTime(e.target.value)}
                        required
                        disabled={showPayment}
                        style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #cbd5e1" }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* PASSPORT / ID UPLOAD */}
              <div className="booking-section">
                <h3 className="section-title" style={{ display: "block", marginBottom: "15px", fontWeight: "700", color: "#1e293b", fontSize: "16px" }}>
                  {isInternational ? "Passport Copy (Required for Visa/Travel) *" : "Govt. ID Proof (Required for Hotel Check-in) *"}
                </h3>

                <div className="file-upload-container">
                  <div className="upload-box" style={{ border: idProof ? "2px solid #10b981" : "2px dashed #cbd5e1", padding: "24px", borderRadius: "12px", textAlign: "center", background: idProof ? "#ecfdf5" : "#f8fafc", position: "relative" }}>

                    {idProof ? (
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <span style={{ fontSize: "24px" }}>{isUploading ? "⏳" : "✅"}</span>
                          <span className="file-name" style={{ fontSize: "14px", fontWeight: "bold", color: "#065f46", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "250px" }}>
                            {idProof.name} {isUploading && "(Uploading...)"}
                          </span>
                        </div>
                        {!showPayment && !isUploading && (
                          <button type="button" onClick={() => { setIdProof(null); setIdProofUrl(null); }} style={{ color: "#ef4444", background: "none", border: "none", cursor: "pointer", fontWeight: "bold", textDecoration: "underline" }}>Remove</button>
                        )}
                      </div>
                    ) : (
                      <>
                        <span className="upload-icon" style={{ fontSize: "32px", display: "block", marginBottom: "10px" }}>{isInternational ? "🛂" : "🪪"}</span>
                        <p style={{ margin: "0 0 15px 0", fontSize: "15px", color: "#475569", fontWeight: "600" }}>Click or drag to upload {isInternational ? "Passport" : "ID Proof"}</p>

                        <input
                          type="file"
                          accept=".jpg, .jpeg, .pdf, .png"
                          onChange={handleFileUpload}
                          className="file-input"
                          id="passport-upload"
                          disabled={showPayment || isUploading}
                          style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", opacity: 0, cursor: (showPayment || isUploading) ? "not-allowed" : "pointer" }}
                        />

                        <label htmlFor="passport-upload" className="btn-browse" style={{ padding: "10px 20px", background: "white", color: "#334155", border: "1px solid #cbd5e1", borderRadius: "8px", fontWeight: "bold", fontSize: "13px", display: "inline-block", pointerEvents: "none", boxShadow: "0 2px 4px rgba(0,0,0,0.02)" }}>
                          Browse Files
                        </label>
                      </>
                    )}
                  </div>
                  <p className="upload-hint" style={{ color: "#94a3b8", fontWeight: "500", marginTop: "10px", display: "block", fontSize: "13px" }}>
                    Accepted formats: JPG, JPEG, PDF, PNG (Max 5MB).
                  </p>
                </div>
              </div>

              <hr style={{ border: "none", borderTop: "1px solid #e2e8f0", margin: "10px 0" }} />

              {/* ✅ AGREEMENT CHECKBOX — shown before Proceed button */}
              {!showPayment && (
                <div style={{ padding: "15px", backgroundColor: "#fffbeb", border: "1px solid #fcd34d", borderRadius: "8px" }}>
                  <label style={{ display: "flex", alignItems: "flex-start", gap: "10px", cursor: "pointer" }}>
                    <input
                      type="checkbox"
                      checked={agreedToTerms}
                      onChange={(e) => setAgreedToTerms(e.target.checked)}
                      style={{ width: "18px", height: "18px", marginTop: "2px", cursor: "pointer" }}
                    />
                    <span style={{ fontSize: "14px", color: "#92400e", lineHeight: "1.5" }}>
                      I have read and agree to the <strong>Cancellation Policy</strong> (100% refund at 30+ days, 50% at 15-29 days, 25% at 7-14 days, 0% within 7 days) and the full <a href="/terms" target="_blank" rel="noopener noreferrer" style={{ color: "#2563eb", textDecoration: "underline" }}>Terms & Conditions</a>.
                    </span>
                  </label>
                </div>
              )}

              {/* ACTION BUTTONS */}
              {!showPayment ? (
                <button
                  onClick={handleProceed}
                  className="btn-proceed"
                  disabled={availableDates.length === 0 || (seatsLeft !== null && seatsLeft < totalPeople) || !agreedToTerms}
                  style={{
                    padding: "20px",
                    background: (availableDates.length === 0 || (seatsLeft !== null && seatsLeft < totalPeople) || !agreedToTerms) ? "#94a3b8" : "#0f172a",
                    color: "white",
                    border: "none",
                    borderRadius: "14px",
                    fontSize: "18px",
                    fontWeight: "800",
                    cursor: (availableDates.length === 0 || (seatsLeft !== null && seatsLeft < totalPeople) || !agreedToTerms) ? "not-allowed" : "pointer",
                    transition: "all 0.3s ease",
                    boxShadow: (availableDates.length === 0 || (seatsLeft !== null && seatsLeft < totalPeople) || !agreedToTerms) ? "none" : "0 10px 20px -5px rgba(15, 23, 42, 0.4)",
                    width: "100%"
                  }}
                >
                  {availableDates.length === 0 ? "Unavailable 🚫" :
                   (seatsLeft !== null && seatsLeft < totalPeople) ? "Not enough seats 🚫" :
                   !agreedToTerms ? "Please Accept Terms to Continue" :
                   "Proceed to Secure Payment →"}
                </button>
              ) : (
                <div style={{ padding: "24px", background: "#fef3c7", borderRadius: "16px", border: "1px solid #fde68a", textAlign: "center" }}>
                  <p style={{ margin: "0 0 15px 0", color: "#b45309", fontWeight: "bold", fontSize: "16px" }}>Review your final total: ₹{totalPrice.toLocaleString()}</p>

                  <button
                    onClick={handlePayment}
                    disabled={loading}
                    style={{
                      width: "100%",
                      padding: "20px",
                      background: loading ? "#94a3b8" : "#16a34a",
                      color: "white",
                      border: "none",
                      borderRadius: "12px",
                      fontSize: "18px",
                      fontWeight: "900",
                      cursor: loading ? "not-allowed" : "pointer",
                      boxShadow: loading ? "none" : "0 10px 20px -5px rgba(22, 163, 74, 0.4)",
                      transition: "all 0.3s ease"
                    }}
                  >
                    {loading ? "Initializing Secure Gateway..." : "Pay Now with Razorpay 💳"}
                  </button>

                  {!loading && (
                    <button onClick={() => setShowPayment(false)} style={{ background: 'none', border: 'none', color: '#b45309', textDecoration: 'underline', marginTop: '15px', cursor: 'pointer', fontWeight: "bold" }}>
                      ← Wait, go back and edit details
                    </button>
                  )}
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </main>
  );
}