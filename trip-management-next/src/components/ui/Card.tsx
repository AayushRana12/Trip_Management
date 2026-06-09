"use client";

import "@/assets/styles/packages.css";
import { useRouter } from "next/navigation";

type CardProps = {
  id: number;
  title: string;
  price: number;
  image: string;
  discounted_price?: number; 
  offer_name?: string;       
  discount_percentage?: number; 
  average_rating?: number;  
  review_count?: number;    
  duration_days?: string;       
  is_international?: boolean;   
};

export default function Card({ 
  id, 
  title, 
  price, 
  image, 
  discounted_price, 
  offer_name, 
  discount_percentage,
  average_rating,           
  review_count,
  duration_days,
  is_international
}: CardProps) {
  const router = useRouter();

  const handleBooking = (e: React.MouseEvent) => {
    e.stopPropagation(); // ✅ Prevents the Quick View modal from opening!

    const user = JSON.parse(localStorage.getItem("user") || "{}");

    if (!user.id) {
      alert("Please login first to book a trip!");
      return;
    }

    router.push(`/booking/${id}`);
  };

  return (
    <>
      {/* 🌟 Premium CSS Animations */}
      <style>{`
        .premium-card-ui {
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        .premium-card-ui:hover {
          transform: translateY(-8px) !important;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15) !important;
        }
        .premium-card-ui img {
          transition: transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }
        .premium-card-ui:hover img {
          transform: scale(1.08);
        }
      `}</style>

      <div className="premium-card-ui package-card" style={{ background: "white", borderRadius: "24px", overflow: "hidden", border: "none", boxShadow: "0 10px 30px rgba(0,0,0,0.04)", cursor: "pointer", display: "flex", flexDirection: "column", height: "100%", position: "relative" }}>
        
        {/* 📸 IMAGE & BADGES SECTION */}
        <div style={{ position: "relative", height: "260px", overflow: "hidden" }}>
          
          {/* Discount Badge */}
          {discount_percentage && (
            <div className="offer-badge" style={{ position: "absolute", top: "20px", right: "20px", background: "#ef4444", color: "white", padding: "6px 14px", borderRadius: "10px", fontWeight: "800", fontSize: "13px", zIndex: 10, boxShadow: "0 4px 10px rgba(239, 68, 68, 0.3)" }}>
              🔥 {discount_percentage}% OFF
            </div>
          )}

          {/* International Badge */}
          {is_international && (
            <div style={{ position: "absolute", top: "20px", left: "20px", background: "rgba(15, 23, 42, 0.7)", color: "white", padding: "6px 14px", borderRadius: "10px", fontSize: "12px", fontWeight: "800", backdropFilter: "blur(8px)", letterSpacing: "0.5px", zIndex: 10 }}>
              🌍 INTERNATIONAL
            </div>
          )}

          <img src={image} alt={title} className="card-image" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </div>

        {/* 📝 CONTENT SECTION */}
        <div className="package-info" style={{ padding: "30px", flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          
          <div>
            <h3 style={{ margin: "0 0 10px 0", fontSize: "22px", color: "#0f172a", fontWeight: "800", lineHeight: "1.3", letterSpacing: "-0.5px" }}>{title}</h3>

            {/* ⭐ Dynamic Database Reviews */}
            <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "14px", marginBottom: "15px" }}>
              <span style={{ color: "#eab308", fontSize: "16px" }}>★</span>
              <span style={{ fontWeight: "700", color: "#0f172a" }}>
                {average_rating ? Number(average_rating).toFixed(1) : "New"}
              </span>
              {review_count !== undefined && review_count > 0 && (
                <span style={{ color: "#64748b", fontWeight: "500" }}>
                  ({review_count} review{review_count > 1 ? 's' : ''})
                </span>
              )}
            </div>

            {/* Special Offer Text */}
            {offer_name && (
              <div style={{ marginBottom: "15px" }}>
                <span className="offer-name-text" style={{ color: "#d97706", fontWeight: "700", fontSize: "12px", background: "#fffbeb", display: "inline-block", padding: "6px 10px", borderRadius: "6px", border: "1px solid #fde68a" }}>
                  ✨ {offer_name}
                </span>
              </div>
            )}

            {/* Duration */}
            {duration_days && (
              <p style={{ color: "#64748b", fontSize: "15px", fontWeight: "600", margin: "0 0 20px 0", display: "flex", alignItems: "center", gap: "6px" }}>
                ⏱️ {duration_days}
              </p>
            )}
          </div>

          <div>
            {/* 💰 Price Section */}
            <div className="price-container" style={{ display: "flex", alignItems: "baseline", gap: "10px", margin: "0 0 20px 0" }}>
              {discounted_price && Number(discounted_price) < Number(price) ? (
                <>
                  <p style={{ margin: 0, color: "#16a34a", fontSize: "28px", fontWeight: "900", letterSpacing: "-1px" }}>
                    ₹{Math.round(discounted_price).toLocaleString()}
                  </p>
                  <span className="original-price" style={{ textDecoration: 'line-through', color: '#94a3b8', fontSize: '16px', fontWeight: "600" }}>
                    ₹{price.toLocaleString()}
                  </span>
                </>
              ) : (
                <p style={{ margin: 0, color: "#16a34a", fontSize: "28px", fontWeight: "900", letterSpacing: "-1px" }}>
                  ₹{price.toLocaleString()} <span style={{ fontSize: "15px", color: "#64748b", fontWeight: "500", letterSpacing: "0" }}>/ person</span>
                </p>
              )}
            </div>

            {/* 🖱️ ACTION BUTTONS (Z-Index fix ensures they are clickable) */}
            <div className="card-actions" style={{ display: "flex", gap: "12px", position: "relative", zIndex: 50 }}>
              <button 
                className="view-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  router.push(`/packages/${id}`);
                }}
                style={{ flex: 1, padding: "14px", background: "#f8fafc", color: "#2563eb", border: "none", borderRadius: "12px", fontWeight: "800", cursor: "pointer", fontSize: "15px", transition: "background 0.2s" }}
                onMouseOver={(e) => e.currentTarget.style.background = "#eff6ff"} 
                onMouseOut={(e) => e.currentTarget.style.background = "#f8fafc"}
              >
                View Details
              </button>
              
              <button 
                className="book-btn"
                onClick={handleBooking}
                style={{ flex: 1, padding: "14px", background: "#2563eb", color: "white", border: "none", borderRadius: "12px", fontWeight: "800", cursor: "pointer", fontSize: "15px", transition: "all 0.2s", boxShadow: "0 4px 12px rgba(37, 99, 235, 0.3)" }}
                onMouseOver={(e) => { e.currentTarget.style.background = "#1d4ed8"; e.currentTarget.style.transform = "translateY(-2px)"; }} 
                onMouseOut={(e) => { e.currentTarget.style.background = "#2563eb"; e.currentTarget.style.transform = "translateY(0)"; }}
              >
                Book Now
              </button>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}