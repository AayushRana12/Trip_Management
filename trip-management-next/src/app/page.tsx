"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();
  const [featuredPackages, setFeaturedPackages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchDestination, setSearchDestination] = useState("");

  useEffect(() => {
    fetch("http://localhost:8000/api/packages")
      .then((res) => res.json())
      .then((data) => {
        setFeaturedPackages(data.slice(0, 3));
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch packages", err);
        setLoading(false);
      });
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/packages?search=${searchDestination}`);
  };

  return (
    <main style={{ fontFamily: "'Inter', sans-serif", background: "#f8fafc", minHeight: "100vh" }}>
      
      {/* Premium CSS Animations */}
      <style>{`
        .premium-card {
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        .premium-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15);
        }
        .premium-card img {
          transition: transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }
        .premium-card:hover img {
          transform: scale(1.08);
        }
        .search-input::placeholder {
          color: #94a3b8;
          font-weight: 500;
        }
      `}</style>

      {/* =========================================================
          1. HERO SECTION (Ultra-Sleek Glassmorphism)
          ========================================================= */}
      <section style={{ 
        position: "relative", 
        height: "80vh", 
        minHeight: "600px",
        display: "flex", 
        flexDirection: "column",
        justifyContent: "center", 
        alignItems: "center",
        backgroundImage: "linear-gradient(to bottom, rgba(15, 23, 42, 0.2), rgba(15, 23, 42, 0.75)), url('https://images.unsplash.com/photo-1499678329028-101435549a4e?q=80&w=2000&auto=format&fit=crop')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        color: "white",
        padding: "0 20px",
        textAlign: "center"
      }}>
        <h1 style={{ fontSize: "64px", fontWeight: "900", letterSpacing: "-2px", margin: "0 0 20px 0", lineHeight: "1.05", textShadow: "0 10px 30px rgba(0,0,0,0.3)" }}>
          Discover Your Next <br/><span style={{ color: "#38bdf8", textShadow: "0 0 40px rgba(56, 189, 248, 0.4)" }}>Great Adventure</span> 
        </h1>
        <p style={{ fontSize: "20px", fontWeight: "400", color: "#f1f5f9", marginBottom: "50px", maxWidth: "600px", textShadow: "0 4px 10px rgba(0,0,0,0.5)", lineHeight: "1.6" }}>
          Curated itineraries, premium stays, and unforgettable experiences. Plan your dream trip with absolute confidence.
        </p>

        {/* The Sleek Search Bar */}
        <form onSubmit={handleSearch} style={{
          background: "rgba(255, 255, 255, 0.15)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: "1px solid rgba(255, 255, 255, 0.3)",
          padding: "8px",
          borderRadius: "100px",
          display: "flex",
          gap: "8px",
          width: "100%",
          maxWidth: "750px",
          boxShadow: "0 30px 60px rgba(0,0,0,0.3)"
        }}>
          <div style={{ flex: 1, background: "white", borderRadius: "100px", display: "flex", alignItems: "center", padding: "8px 25px", boxShadow: "inset 0 2px 4px rgba(0,0,0,0.05)" }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: "12px" }}>
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
              <circle cx="12" cy="10" r="3"></circle>
            </svg>
            <input 
              type="text" 
              className="search-input"
              placeholder="Where do you want to go?" 
              value={searchDestination}
              onChange={(e) => setSearchDestination(e.target.value)}
              style={{ width: "100%", border: "none", outline: "none", padding: "12px 0", fontSize: "18px", color: "#0f172a", background: "transparent", fontWeight: "600" }}
            />
          </div>
          <button type="submit" style={{ background: "#2563eb", color: "white", border: "none", borderRadius: "100px", padding: "0 40px", fontSize: "17px", fontWeight: "700", cursor: "pointer", transition: "all 0.3s ease", boxShadow: "0 4px 15px rgba(37, 99, 235, 0.4)" }} onMouseOver={(e) => { e.currentTarget.style.background = "#1d4ed8"; e.currentTarget.style.transform = "scale(1.02)"; }} onMouseOut={(e) => { e.currentTarget.style.background = "#2563eb"; e.currentTarget.style.transform = "scale(1)"; }}>
            Search
          </button>
        </form>
      </section>

      {/* =========================================================
          2. TRUST BADGES (4-Column Layout)
          ========================================================= */}
      <section style={{ maxWidth: "1200px", margin: "-40px auto 80px", position: "relative", zIndex: 10, padding: "0 20px" }}>
        <div style={{ background: "rgba(255, 255, 255, 0.95)", backdropFilter: "blur(10px)", borderRadius: "30px", padding: "30px 40px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "25px", boxShadow: "0 20px 40px rgba(0,0,0,0.06)", border: "1px solid rgba(255,255,255,0.5)" }}>
          
          <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
            <div style={{ background: "#eff6ff", width: "50px", height: "50px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px" }}>🔒</div>
            <div>
              <h4 style={{ margin: "0 0 2px 0", color: "#0f172a", fontSize: "15px", fontWeight: "800", letterSpacing: "-0.5px" }}>Secure Booking</h4>
              <p style={{ margin: 0, color: "#64748b", fontSize: "13px", fontWeight: "500" }}>256-bit SSL encrypted</p>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
            <div style={{ background: "#f0fdf4", width: "50px", height: "50px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px" }}>💵</div>
            <div>
              <h4 style={{ margin: "0 0 2px 0", color: "#0f172a", fontSize: "15px", fontWeight: "800", letterSpacing: "-0.5px" }}>Best Price</h4>
              <p style={{ margin: 0, color: "#64748b", fontSize: "13px", fontWeight: "500" }}>Direct hotel deals</p>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
            <div style={{ background: "#fffbeb", width: "50px", height: "50px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px" }}>✨</div>
            <div>
              <h4 style={{ margin: "0 0 2px 0", color: "#0f172a", fontSize: "15px", fontWeight: "800", letterSpacing: "-0.5px" }}>Premium Stays</h4>
              <p style={{ margin: 0, color: "#64748b", fontSize: "13px", fontWeight: "500" }}>Verified luxury hotels</p>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
            <div style={{ background: "#fef2f2", width: "50px", height: "50px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px" }}>🎧</div>
            <div>
              <h4 style={{ margin: "0 0 2px 0", color: "#0f172a", fontSize: "15px", fontWeight: "800", letterSpacing: "-0.5px" }}>24/7 Support</h4>
              <p style={{ margin: 0, color: "#64748b", fontSize: "13px", fontWeight: "500" }}>Global concierge</p>
            </div>
          </div>

        </div>
      </section>

      {/* =========================================================
          3. FEATURED PACKAGES (Dynamic Reviews)
          ========================================================= */}
      <section style={{ maxWidth: "1200px", margin: "0 auto 100px", padding: "0 20px" }}>
        <div style={{ textAlign: "center", marginBottom: "60px" }}>
          <p style={{ color: "#2563eb", fontWeight: "800", fontSize: "14px", letterSpacing: "2px", textTransform: "uppercase", margin: "0 0 10px 0" }}>Explore The World</p>
          <h2 style={{ fontSize: "42px", fontWeight: "900", color: "#0f172a", margin: "0", letterSpacing: "-1.5px" }}>Trending Destinations</h2>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "50px", color: "#64748b", fontSize: "18px", fontWeight: "500" }}>Discovering amazing trips...</div>
        ) : (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "40px", marginBottom: "60px" }}>
              {featuredPackages.map((pkg) => (
                <div key={pkg.id} className="premium-card" style={{ background: "white", borderRadius: "24px", overflow: "hidden", border: "none", boxShadow: "0 10px 30px rgba(0,0,0,0.04)", cursor: "pointer", display: "flex", flexDirection: "column" }}>
                  
                  <div style={{ position: "relative", height: "260px", overflow: "hidden" }}>
                    <img src={pkg.image} alt={pkg.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    {pkg.is_international && (
                      <div style={{ position: "absolute", top: "20px", left: "20px", background: "rgba(15, 23, 42, 0.7)", color: "white", padding: "6px 14px", borderRadius: "10px", fontSize: "12px", fontWeight: "800", backdropFilter: "blur(8px)", letterSpacing: "0.5px" }}>
                        🌍 INTERNATIONAL
                      </div>
                    )}
                  </div>

                  <div style={{ padding: "30px", flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                    <div>
                      <h3 style={{ margin: "0 0 10px 0", fontSize: "22px", color: "#0f172a", fontWeight: "800", lineHeight: "1.3", letterSpacing: "-0.5px" }}>{pkg.title}</h3>
                      
                      {/* ✅ DYNAMIC REVIEWS FETCHED FROM DATABASE */}
                      {pkg.review_count && Number(pkg.review_count) > 0 ? (
                        <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "14px", fontWeight: "700", marginBottom: "15px" }}>
                          <span style={{ color: "#eab308", fontSize: "16px" }}>★</span>
                          <span style={{ color: "#0f172a" }}>{Number(pkg.average_rating).toFixed(1)}</span>
                          <span style={{ color: "#94a3b8", fontWeight: "500" }}>({pkg.review_count} review{Number(pkg.review_count) > 1 ? 's' : ''})</span>
                        </div>
                      ) : (
                        <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "14px", fontWeight: "700", marginBottom: "15px" }}>
                          <span style={{ color: "#eab308", fontSize: "16px" }}>★</span>
                          <span style={{ color: "#0f172a" }}>New</span>
                        </div>
                      )}
                      
                      {pkg.duration_days && (
                        <p style={{ color: "#64748b", fontSize: "15px", fontWeight: "600", margin: "0 0 20px 0", display: "flex", alignItems: "center", gap: "6px" }}>
                          ⏱️ {pkg.duration_days}
                        </p>
                      )}
                    </div>

                    <div>
                      <p style={{ margin: "0 0 20px 0", color: "#0f172a", fontSize: "28px", fontWeight: "900", letterSpacing: "-1px" }}>
                        ₹{Number(pkg.price).toLocaleString()} <span style={{ fontSize: "15px", color: "#64748b", fontWeight: "500", letterSpacing: "0" }}>/ person</span>
                      </p>

                      <div style={{ display: "flex", gap: "12px" }}>
                        <Link href={`/packages/${pkg.id}`} style={{ flex: 1, textAlign: "center", background: "#f8fafc", color: "#2563eb", padding: "14px", borderRadius: "12px", fontWeight: "800", textDecoration: "none", transition: "background 0.2s", fontSize: "15px" }} onMouseOver={(e) => e.currentTarget.style.background = "#eff6ff"} onMouseOut={(e) => e.currentTarget.style.background = "#f8fafc"}>
                          View Details
                        </Link>
                        {/* ✅ Back to Brand Blue (#2563eb) */}
                        <Link href={`/packages/${pkg.id}`} style={{ flex: 1, textAlign: "center", background: "#2563eb", color: "white", padding: "14px", borderRadius: "12px", fontWeight: "800", textDecoration: "none", transition: "all 0.2s", fontSize: "15px", boxShadow: "0 4px 12px rgba(37, 99, 235, 0.3)" }} onMouseOver={(e) => { e.currentTarget.style.background = "#1d4ed8"; e.currentTarget.style.transform = "translateY(-2px)"; }} onMouseOut={(e) => { e.currentTarget.style.background = "#2563eb"; e.currentTarget.style.transform = "translateY(0)"; }}>
                          Book Now
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ textAlign: "center" }}>
              <Link href="/packages" style={{ 
                display: "inline-flex", 
                alignItems: "center",
                gap: "8px",
                background: "white", 
                color: "#0f172a", 
                padding: "18px 45px", 
                borderRadius: "100px", 
                fontSize: "16px", 
                fontWeight: "800", 
                textDecoration: "none", 
                border: "1px solid #e2e8f0",
                boxShadow: "0 10px 25px rgba(0,0,0,0.05)",
                transition: "all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)" 
              }} 
              onMouseOver={(e) => { e.currentTarget.style.boxShadow = "0 20px 35px rgba(0,0,0,0.1)"; e.currentTarget.style.transform = "translateY(-3px)"; }} 
              onMouseOut={(e) => { e.currentTarget.style.boxShadow = "0 10px 25px rgba(0,0,0,0.05)"; e.currentTarget.style.transform = "translateY(0)"; }}>
                View All Destinations 
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"></path><path d="M12 5l7 7-7 7"></path></svg>
              </Link>
            </div>
          </>
        )}
      </section>

    </main>
  );
}