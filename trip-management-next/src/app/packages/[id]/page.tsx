"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import toast, { Toaster } from "react-hot-toast";

export default function PackageDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  
  // --- STATES ---
  const [pkg, setPkg] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const [reviews, setReviews] = useState<any[]>([]);
  const [userName, setUserName] = useState("");
  const [userRating, setUserRating] = useState(5);
  const [comment, setComment] = useState("");

  const [currentImgIndex, setCurrentImgIndex] = useState(0);

  // --- FETCH DATA ---
  useEffect(() => {
    if (!id) return;
    
    fetch(`http://localhost:8000/api/packages/${id}?t=${new Date().getTime()}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch package details");
        return res.json();
      })
      .then((data) => {
        setPkg(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });

    fetch(`http://localhost:8000/api/packages/${id}/reviews`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setReviews(data);
        } else {
          setReviews([]);
        }
      })
      .catch((err) => console.error("Failed to fetch reviews", err));
  }, [id]);

  // --- REVIEW LOGIC ---
  const averageRating = reviews.length > 0 
    ? (reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length).toFixed(1) 
    : "New";

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`http://localhost:8000/api/packages/${id}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_name: userName, rating: userRating, comment })
      });
      if (res.ok) {
        const newReview = await res.json();
        setReviews([newReview, ...reviews]); 
        setUserName(""); 
        setComment(""); 
        setUserRating(5); 
      }
    } catch (err) {
      console.error("Failed to submit review", err);
    }
  };

  if (loading) return <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", fontSize: "18px", color: "#64748b" }}>Preparing your itinerary...</div>;
  if (!pkg) return <div style={{ textAlign: "center", marginTop: "50px", fontSize: "20px", color: "#64748b" }}>Package not found.</div>;

  const hotelImages = pkg.hotel_images || [];
  const allImages = [pkg.image, ...hotelImages].filter(Boolean);
  const currentPrice = pkg.discounted_price ? Number(pkg.discounted_price) : Number(pkg.price);

  return (
    <main style={{ background: "#f8fafc", minHeight: "100vh", padding: "60px 20px", fontFamily: "'Inter', sans-serif" }}>
      <Toaster position="top-center" containerStyle={{ zIndex: 99999 }} />
      
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        
        {/* Back Button */}
        <button onClick={() => router.back()} style={{ background: "transparent", border: "none", color: "#64748b", fontWeight: "bold", cursor: "pointer", marginBottom: "30px", fontSize: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
          ← Back to Packages
        </button>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 400px", gap: "40px", alignItems: "start" }}>
          
          {/* =========================================================
              LEFT SIDE: GALLERY & CONTENT
              ========================================================= */}
          <div style={{ display: "flex", flexDirection: "column", gap: "40px" }}>
            
            {/* 🏨 MODERN BARCELONA IMAGE GALLERY */}
            <div style={{ 
              background: "white", 
              borderRadius: "24px", 
              overflow: "hidden", 
              boxShadow: "0 10px 30px rgba(0,0,0,0.08)", 
              border: "1px solid #e2e8f0" 
            }}>
              
              <div style={{ position: "relative", height: "400px", background: "#f1f5f9" }}>
                <img 
                  src={allImages[currentImgIndex]} 
                  alt="Package Scenery" 
                  style={{ width: "100%", height: "100%", objectFit: "cover", transition: "opacity 0.4s ease-in-out" }} 
                  onError={(e) => { (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1539103372884-cc235bc2bad6?w=1000&q=80"; }}
                />
                
                <div style={{ position: "absolute", top: "50%", width: "100%", display: "flex", justifyContent: "space-between", padding: "0 15px", transform: "translateY(-50%)", pointerEvents: "none" }}>
                  <button 
                    onClick={() => setCurrentImgIndex((prev) => (prev === 0 ? allImages.length - 1 : prev - 1))}
                    style={{ pointerEvents: "auto", background: "white", color: "#0f172a", border: "none", borderRadius: "50%", width: "40px", height: "40px", cursor: "pointer", boxShadow: "0 4px 12px rgba(0,0,0,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold" }}>
                    ❮
                  </button>
                  <button 
                    onClick={() => setCurrentImgIndex((prev) => (prev === allImages.length - 1 ? 0 : prev + 1))}
                    style={{ pointerEvents: "auto", background: "white", color: "#0f172a", border: "none", borderRadius: "50%", width: "40px", height: "40px", cursor: "pointer", boxShadow: "0 4px 12px rgba(0,0,0,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold" }}>
                    ❯
                  </button>
                </div>

                <div style={{ position: "absolute", top: "20px", right: "20px", background: "rgba(15, 23, 42, 0.8)", color: "white", padding: "8px 16px", borderRadius: "30px", fontSize: "13px", fontWeight: "600", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", gap: "6px" }}>
                  🏛️ Architecture & Food
                </div>
              </div>

              <div style={{ display: "flex", gap: "12px", padding: "20px", background: "white", justifyContent: "center" }}>
                {allImages.map((imgUrl, idx) => (
                  <div 
                    key={idx}
                    onClick={() => setCurrentImgIndex(idx)}
                    style={{ 
                      width: "80px", 
                      height: "60px", 
                      borderRadius: "12px", 
                      overflow: "hidden", 
                      cursor: "pointer",
                      border: currentImgIndex === idx ? "3px solid #2563eb" : "3px solid transparent",
                      transition: "all 0.2s ease",
                      opacity: currentImgIndex === idx ? 1 : 0.6
                    }}
                  >
                    <img 
                      src={imgUrl} 
                      alt={`Thumbnail ${idx + 1}`} 
                      style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.3s ease" }}
                      onMouseOver={(e) => (e.currentTarget.style.transform = "scale(1.1)")}
                      onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
                      onError={(e) => { (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1539103372884-cc235bc2bad6?w=200&q=80"; }}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* 📝 TRIP DETAILS CARD */}
            <div style={{ background: "white", padding: "40px", borderRadius: "24px", border: "1px solid #e2e8f0", boxShadow: "0 10px 25px rgba(0,0,0,0.02)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
                <span style={{ color: "#2563eb", fontWeight: "800", fontSize: "13px", textTransform: "uppercase", letterSpacing: "1.5px", background: "#eff6ff", padding: "6px 12px", borderRadius: "8px" }}>
                  ⏱️ {pkg.duration_days || "Duration TBD"}
                </span>
                <span style={{ width: "4px", height: "4px", background: "#cbd5e1", borderRadius: "50%" }}></span>
                <span style={{ color: "#2563eb", fontWeight: "800", fontSize: "13px", textTransform: "uppercase", letterSpacing: "1.5px", background: "#eff6ff", padding: "6px 12px", borderRadius: "8px" }}>
                  Verified Itinerary
                </span>
                <span style={{ width: "4px", height: "4px", background: "#cbd5e1", borderRadius: "50%" }}></span>
                <span style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "14px", fontWeight: "700", color: "#0f172a" }}>
                  <span style={{ color: "#eab308", fontSize: "18px" }}>★</span> {averageRating} 
                  <span style={{ color: "#64748b", fontWeight: "500" }}>({reviews.length} verified reviews)</span>
                </span>
              </div>

              <h1 style={{ fontSize: "42px", fontWeight: "900", color: "#0f172a", margin: "0 0 40px 0", lineHeight: "1.1", letterSpacing: "-1px" }}>{pkg.title}</h1>

              <div style={{ marginTop: "10px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "50px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "16px", padding: "20px", background: "#f8fafc", borderRadius: "20px", border: "1px solid #f1f5f9", transition: "transform 0.2s", cursor: "default" }} onMouseOver={(e) => e.currentTarget.style.transform = "translateY(-2px)"} onMouseOut={(e) => e.currentTarget.style.transform = "translateY(0)"}>
                    <div style={{ fontSize: "28px", background: "white", width: "55px", height: "55px", borderRadius: "16px", display: "flex", justifyContent: "center", alignItems: "center", boxShadow: "0 4px 10px rgba(0,0,0,0.03)" }}>🏨</div>
                    <div>
                      <h4 style={{ margin: "0 0 4px 0", color: "#0f172a", fontSize: "16px", fontWeight: "800" }}>Accommodations</h4>
                      <p style={{ margin: 0, color: "#64748b", fontSize: "14px", fontWeight: "500" }}>Premium Stay Included</p>
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "16px", padding: "20px", background: "#f8fafc", borderRadius: "20px", border: "1px solid #f1f5f9", transition: "transform 0.2s", cursor: "default" }} onMouseOver={(e) => e.currentTarget.style.transform = "translateY(-2px)"} onMouseOut={(e) => e.currentTarget.style.transform = "translateY(0)"}>
                    <div style={{ fontSize: "28px", background: "white", width: "55px", height: "55px", borderRadius: "16px", display: "flex", justifyContent: "center", alignItems: "center", boxShadow: "0 4px 10px rgba(0,0,0,0.03)" }}>🍳</div>
                    <div>
                      <h4 style={{ margin: "0 0 4px 0", color: "#0f172a", fontSize: "16px", fontWeight: "800" }}>Meals</h4>
                      <p style={{ margin: 0, color: "#64748b", fontSize: "14px", fontWeight: "500" }}>Breakfast & Dinner</p>
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "16px", padding: "20px", background: "#f8fafc", borderRadius: "20px", border: "1px solid #f1f5f9", transition: "transform 0.2s", cursor: "default" }} onMouseOver={(e) => e.currentTarget.style.transform = "translateY(-2px)"} onMouseOut={(e) => e.currentTarget.style.transform = "translateY(0)"}>
                    <div style={{ fontSize: "28px", background: "white", width: "55px", height: "55px", borderRadius: "16px", display: "flex", justifyContent: "center", alignItems: "center", boxShadow: "0 4px 10px rgba(0,0,0,0.03)" }}>🗺️</div>
                    <div>
                      <h4 style={{ margin: "0 0 4px 0", color: "#0f172a", fontSize: "16px", fontWeight: "800" }}>Sightseeing</h4>
                      <p style={{ margin: 0, color: "#64748b", fontSize: "14px", fontWeight: "500" }}>Guided Tours Included</p>
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "16px", padding: "20px", background: "#f8fafc", borderRadius: "20px", border: "1px solid #f1f5f9", transition: "transform 0.2s", cursor: "default" }} onMouseOver={(e) => e.currentTarget.style.transform = "translateY(-2px)"} onMouseOut={(e) => e.currentTarget.style.transform = "translateY(0)"}>
                    <div style={{ fontSize: "28px", background: "white", width: "55px", height: "55px", borderRadius: "16px", display: "flex", justifyContent: "center", alignItems: "center", boxShadow: "0 4px 10px rgba(0,0,0,0.03)" }}>🚕</div>
                    <div>
                      <h4 style={{ margin: "0 0 4px 0", color: "#0f172a", fontSize: "16px", fontWeight: "800" }}>Transfers</h4>
                      <p style={{ margin: 0, color: "#64748b", fontSize: "14px", fontWeight: "500" }}>Pickup & Drop Facility</p>
                    </div>
                  </div>
                </div>

                <div style={{ marginBottom: "50px" }}>
                  <h3 style={{ fontSize: "24px", color: "#0f172a", fontWeight: "900", marginBottom: "16px" }}>About this journey</h3>
                  <p style={{ fontSize: "16px", color: "#475569", lineHeight: "1.8", margin: 0 }}>
                    {pkg.description || "Immerse yourself in the heart of Catalonia! Discover the genius of Gaudí at the Sagrada Familia, stroll through the vibrant Las Ramblas, and enjoy an evening of authentic tapas tasting in the Gothic Quarter. This tour perfectly blends breathtaking urban design with the rich culinary heritage of Spain."}
                  </p>
                </div>

                <div>
                  <h3 style={{ fontSize: "24px", color: "#0f172a", fontWeight: "900", marginBottom: "30px" }}>Your Itinerary</h3>
                  
                  <div style={{ paddingLeft: "20px", borderLeft: "3px dashed #cbd5e1", marginLeft: "10px" }}>
                    {pkg.itinerary && pkg.itinerary.length > 0 ? (
                      pkg.itinerary.map((plan: string, index: number) => {
                        const isFirst = index === 0;
                        const isLast = index === pkg.itinerary.length - 1;
                        
                        return (
                          <div key={index} style={{ position: "relative", paddingBottom: isLast ? "0px" : "40px" }}>
                            {isFirst ? (
                              <div style={{ position: "absolute", left: "-28px", top: "0", background: "#2563eb", width: "14px", height: "14px", borderRadius: "50%", border: "4px solid #eff6ff", outline: "1px solid #2563eb" }}></div>
                            ) : (
                              <div style={{ position: "absolute", left: "-28px", top: "0", background: "white", width: "14px", height: "14px", borderRadius: "50%", border: "4px solid #cbd5e1" }}></div>
                            )}
                            
                            <div style={{ background: "white", padding: "20px", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 4px 10px rgba(0,0,0,0.02)", marginTop: "-5px" }}>
                              <h4 style={{ margin: "0 0 8px 0", color: "#0f172a", fontSize: "18px", fontWeight: "800" }}>
                                <span style={{ color: isFirst ? "#2563eb" : "#64748b", marginRight: "8px" }}>Day {index + 1}</span> 
                              </h4>
                              <p style={{ margin: 0, color: "#64748b", lineHeight: "1.7", fontSize: "15px" }}>
                                {plan}
                              </p>
                            </div>
                          </div>
                        )
                      })
                    ) : (
                      <p style={{ color: "#64748b" }}>No itinerary details available for this package.</p>
                    )}
                  </div>
                </div>

              </div>

              {/* REVIEWS SECTION */}
              <div style={{ borderTop: "1px solid #f1f5f9", paddingTop: "40px", marginTop: "60px" }}>
                <h3 style={{ fontSize: "22px", fontWeight: "800", color: "#0f172a", marginBottom: "30px" }}>Guest Reviews</h3>
                <form onSubmit={handleSubmitReview} style={{ marginBottom: "50px", background: "#f8fafc", padding: "30px", borderRadius: "20px", border: "1px solid #e2e8f0" }}>
                  <h4 style={{ margin: "0 0 20px 0", fontSize: "16px", color: "#0f172a" }}>Share your experience</h4>
                  <div style={{ display: "flex", gap: "15px", marginBottom: "15px" }}>
                    <input placeholder="Your Name" value={userName} onChange={(e) => setUserName(e.target.value)} required style={{ flex: 1, padding: "12px", borderRadius: "10px", border: "1px solid #cbd5e1", outline: "none", fontFamily: "inherit" }} />
                    <select value={userRating} onChange={(e) => setUserRating(Number(e.target.value))} style={{ padding: "12px", borderRadius: "10px", border: "1px solid #cbd5e1", outline: "none", background: "white", fontFamily: "inherit" }}>
                      {[5,4,3,2,1].map(num => <option key={num} value={num}>{num} Stars</option>)}
                    </select>
                  </div>
                  <textarea placeholder="Tell us about your trip..." value={comment} onChange={(e) => setComment(e.target.value)} required style={{ width: "100%", padding: "12px", borderRadius: "10px", border: "1px solid #cbd5e1", minHeight: "80px", marginBottom: "15px", outline: "none", resize: "vertical", boxSizing: "border-box", fontFamily: "inherit" }} />
                  <button type="submit" style={{ background: "#0f172a", color: "white", padding: "12px 25px", border: "none", borderRadius: "10px", fontWeight: "700", cursor: "pointer", transition: "0.2s" }}>Submit Review</button>
                </form>

                <div style={{ display: "flex", flexDirection: "column", gap: "30px" }}>
                  {reviews.length === 0 ? (
                    <p style={{ color: "#64748b", textAlign: "center", padding: "40px 0", background: "#f8fafc", borderRadius: "20px", border: "1px dashed #cbd5e1" }}>No reviews yet. Be the first to share your experience!</p>
                  ) : (
                    reviews.map((rev, idx) => (
                      <div key={rev.id || idx} style={{ paddingBottom: "30px", borderBottom: "1px solid #f1f5f9" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                          <span style={{ fontWeight: "800", color: "#0f172a", fontSize: "16px" }}>{rev.user_name}</span>
                          <span style={{ color: "#eab308", letterSpacing: "2px", fontSize: "14px" }}>{"★".repeat(rev.rating)}<span style={{ color: "#e2e8f0" }}>{"★".repeat(5 - rev.rating)}</span></span>
                        </div>
                        <p style={{ color: "#475569", margin: 0, lineHeight: "1.6", fontSize: "15px" }}>{rev.comment}</p>
                        {rev.created_at && <span style={{ fontSize: "12px", color: "#94a3b8", marginTop: "10px", display: "block" }}>{new Date(rev.created_at).toLocaleDateString("en-IN")}</span>}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

          </div>

          {/* =========================================================
              RIGHT SIDE: STICKY BOOKING CARD 
              ========================================================= */}
          <div style={{ position: "sticky", top: "100px", alignSelf: "start" }}> 
            
            <div style={{ background: "white", padding: "32px", borderRadius: "24px", boxShadow: "0 10px 25px rgba(0,0,0,0.05)", border: "1px solid #e2e8f0" }}>
              
              <p style={{ margin: "0 0 8px 0", color: "#64748b", fontSize: "13px", fontWeight: "800", textTransform: "uppercase", letterSpacing: "1.5px" }}>
                STARTING FROM
              </p>
              
              <div style={{ display: "flex", alignItems: "baseline", gap: "6px", marginBottom: "32px" }}>
                <span style={{ fontSize: "46px", fontWeight: "900", color: "#0f172a", letterSpacing: "-1px" }}>₹{currentPrice.toLocaleString()}</span>
                <span style={{ color: "#64748b", fontWeight: "500", fontSize: "18px" }}>/ person</span>
              </div>

              <div style={{ background: "#f8fafc", padding: "24px", borderRadius: "16px", marginBottom: "32px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                  <span style={{ color: "#475569", fontWeight: "700", fontSize: "16px" }}>Duration</span>
                  <span style={{ color: "#0f172a", fontWeight: "900", fontSize: "16px" }}>{pkg.duration_days}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ color: "#475569", fontWeight: "700", fontSize: "16px" }}>Cancellation</span>
                  <span style={{ color: "#10b981", fontWeight: "800", fontSize: "16px" }}>Free up to 48hrs</span>
                </div>
              </div>

              {/* Actions Grid */}
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                
                {/* Primary Button */}
                <button 
                  onClick={() => router.push(`/booking/${pkg.id}`)}
                  style={{ width: "100%", padding: "18px", background: "#2563eb", color: "white", border: "none", borderRadius: "14px", fontSize: "16px", fontWeight: "800", cursor: "pointer", textDecoration: "none", display: "inline-block", textAlign: "center", transition: "opacity 0.2s ease" }} 
                  onMouseOver={(e) => e.currentTarget.style.opacity = "0.9"} 
                  onMouseOut={(e) => e.currentTarget.style.opacity = "1"}
                >
                  Book Now
                </button>

                {/* Secondary Outline Button */}
                <Link href="/packages" style={{ width: "100%", padding: "18px", background: "white", color: "#64748b", border: "1px solid #e2e8f0", borderRadius: "14px", fontSize: "16px", fontWeight: "800", cursor: "pointer", textDecoration: "none", display: "inline-block", textAlign: "center", transition: "all 0.2s ease" }} onMouseOver={(e) => { e.currentTarget.style.background = "#f8fafc"; e.currentTarget.style.color = "#0f172a"; }} onMouseOut={(e) => { e.currentTarget.style.background = "white"; e.currentTarget.style.color = "#64748b"; }}>
                  ← Back to all packages
                </Link>

              </div>

              {/* Footer */}
              <div style={{ textAlign: "center", marginTop: "24px" }}>
                 <p style={{ margin: 0, fontSize: "13px", color: "#94a3b8", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", fontWeight: "500" }}>
                   🔒 Secure, SSL encrypted payment
                 </p>
              </div>

            </div>
          </div>

        </div>
      </div>
    </main>
  );
}