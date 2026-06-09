"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Card from "@/components/ui/Card";
import PromoModal from "@/components/ui/PromoModal";
import { Toaster } from "react-hot-toast";
import "@/assets/styles/packages.css";

type Package = {
  id: number;
  title: string;
  price: number;
  image: string;
  duration_days?: string;
  description?: string;
  discounted_price?: number;
  offer_name?: string;
  discount_percentage?: number;
  average_rating?: number | string; 
  review_count?: number | string;
  is_international?: boolean;
};

function PackagesContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // URL search query from the navbar
  const searchQuery = searchParams.get("search")?.toLowerCase() || "";

  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Upgraded Filter States
  const [searchLocation, setSearchLocation] = useState("");
  const [durationFilter, setDurationFilter] = useState("All");
  const [maxBudget, setMaxBudget] = useState<number>(300000);
  const [sortBy, setSortBy] = useState("Featured");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [minRating, setMinRating] = useState(0);

  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const res = await fetch("${API_BASE_URL}/api/packages");
        const data = await res.json();

        if (Array.isArray(data)) {
          setPackages(data);
        }
      } catch (err) {
        console.error("Failed to fetch packages", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPackages();
  }, []);

  const openDetails = (pkg: Package) => {
    setSelectedPackage(pkg);
    setIsModalOpen(true);
  };

  // UPGRADED FILTER & SORTING ENGINE
  const processedPackages = packages
    .filter((pkg) => {
      // 0. URL Search Query Filter (Preserved from navbar search)
      if (searchQuery) {
        const matchesSearchQuery = pkg.title.toLowerCase().includes(searchQuery) ||
          (pkg.description && pkg.description.toLowerCase().includes(searchQuery));
        if (!matchesSearchQuery) return false;
      }

      // 1. Budget Filter
      const currentPrice = pkg.discounted_price ? Number(pkg.discounted_price) : Number(pkg.price);
      if (currentPrice > maxBudget) return false;

      // 2. Location Filter
      if (searchLocation.trim() !== "") {
        const matchesTitle = pkg.title.toLowerCase().includes(searchLocation.toLowerCase());
        if (!matchesTitle) return false;
      }

      // 3. Duration Filter
      if (durationFilter !== "All" && pkg.duration_days) {
        const daysMatch = pkg.duration_days.match(/\d+/);
        const days = daysMatch ? parseInt(daysMatch[0]) : 0;
        
        if (durationFilter === "Short" && days > 3) return false;
        if (durationFilter === "Medium" && (days < 4 || days > 7)) return false;
        if (durationFilter === "Long" && days < 8) return false;
      }

      // 4. Rating Filter 
      if (minRating > 0) {
        const pkgRating = pkg.average_rating ? Number(pkg.average_rating) : 0;
        if (pkgRating < minRating) return false;
      }

      return true;
    })
    .sort((a, b) => {
      // Sort logic
      const priceA = a.discounted_price ? Number(a.discounted_price) : Number(a.price);
      const priceB = b.discounted_price ? Number(b.discounted_price) : Number(b.price);
      if (sortBy === "Price: Low to High") return priceA - priceB;
      if (sortBy === "Price: High to Low") return priceB - priceA;
      return 0; // Featured (Default)
    });

  if (loading) {
    return <div style={{ textAlign: "center", padding: "100px", color: "#64748b", fontSize: "18px", fontWeight: "bold" }}>Loading amazing destinations...</div>;
  }

  return (
    <main style={{ background: "#f8fafc", minHeight: "100vh", padding: "60px 20px" }}>
      <PromoModal />
      <Toaster position="top-center" containerStyle={{ zIndex: 99999 }} />
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>

        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <h1 style={{ fontSize: "36px", color: "#0f172a", margin: "0 0 10px 0", fontWeight: "800" }}>
            {searchQuery ? `Search Results for "${searchParams.get("search")}"` : "Explore All Packages"}
          </h1>
          <p style={{ color: "#64748b", margin: 0, fontSize: "16px" }}>
            Showing {processedPackages.length} {processedPackages.length === 1 ? "trip" : "trips"}
          </p>
        </div>

        {/* Clear Search (Only shows if URL query exists) */}
        {searchQuery && (
          <div style={{ display: "flex", justifyContent: "center", marginBottom: "20px" }}>
            <button
              onClick={() => router.push('/packages')}
              style={{ padding: "10px 20px", background: "#fef2f2", color: "#ef4444", border: "1px solid #fca5a5", borderRadius: "8px", fontWeight: "bold", cursor: "pointer", transition: "all 0.2s" }}
            >
              Clear URL Search
            </button>
          </div>
        )}

        {/* PREMIUM SEARCH & SORT CONSOLE */}
        <div style={{
          display: "flex",
          gap: "15px",
          marginBottom: "40px",
          flexWrap: "wrap",
          background: "white",
          padding: "20px",
          borderRadius: "16px",
          boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.05)",
          border: "1px solid #e2e8f0",
          alignItems: "center"
        }}>
          
          {/* Location Search */}
          <div style={{ flex: 1, minWidth: "250px", position: "relative" }}>
            <span style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", fontSize: "16px", color: "#64748b" }}>📍</span>
            <input
              type="text"
              placeholder="Search destinations, cities..."
              value={searchLocation}
              onChange={(e) => setSearchLocation(e.target.value)}
              style={{ width: "100%", boxSizing: "border-box", padding: "16px 16px 16px 45px", borderRadius: "12px", border: "1px solid #cbd5e1", outline: "none", fontSize: "15px", background: "#f8fafc", color: "#0f172a", fontWeight: "500", transition: "border 0.2s" }}
            />
          </div>

          {/* Sort Dropdown */}
          <div style={{ minWidth: "200px" }}>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{ width: "100%", boxSizing: "border-box", padding: "16px 20px", borderRadius: "12px", border: "1px solid #cbd5e1", outline: "none", fontSize: "15px", background: "#f8fafc", color: "#0f172a", fontWeight: "500", cursor: "pointer" }}
            >
              <option value="Featured">🔃 Sort: Featured</option>
              <option value="Price: Low to High">Price: Low to High</option>
              <option value="Price: High to Low">Price: High to Low</option>
            </select>
          </div>

          {/* Filter Button */}
          <button
            onClick={() => setIsFilterOpen(true)}
            style={{ padding: "16px 24px", background: "#2563eb", color: "white", border: "none", borderRadius: "12px", fontSize: "15px", fontWeight: "bold", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", boxShadow: "0 4px 12px rgba(37, 99, 235, 0.3)", transition: "all 0.2s" }}
            onMouseOver={(e) => { e.currentTarget.style.background = "#1d4ed8"; e.currentTarget.style.transform = "translateY(-2px)"; }}
            onMouseOut={(e) => { e.currentTarget.style.background = "#2563eb"; e.currentTarget.style.transform = "translateY(0)"; }}
          >
            🎛️ Filter By
          </button>
        </div>

        {/* THE SLIDE-OUT FILTER PANEL */}
        {isFilterOpen && (
          <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.4)", zIndex: 9999, display: "flex", justifyContent: "flex-end" }}>
            <div style={{ width: "350px", background: "white", height: "100%", padding: "30px", boxShadow: "-5px 0 25px rgba(0,0,0,0.15)", overflowY: "auto" }}>
              
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px", borderBottom: "1px solid #e2e8f0", paddingBottom: "15px" }}>
                <h2 style={{ margin: 0, fontSize: "22px", color: "#0f172a" }}>Filter Trips</h2>
                <button onClick={() => setIsFilterOpen(false)} style={{ background: "#f1f5f9", border: "none", fontSize: "16px", width: "32px", height: "32px", borderRadius: "50%", cursor: "pointer", fontWeight: "bold", color: "#475569" }}>✕</button>
              </div>

              {/* Duration Filter */}
              <div style={{ marginBottom: "30px" }}>
                <label style={{ display: "block", marginBottom: "10px", fontWeight: "bold", color: "#334155" }}>⏱️ Duration</label>
                <select value={durationFilter} onChange={(e) => setDurationFilter(e.target.value)} style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "15px", outline: "none", background: "#f8fafc" }}>
                  <option value="All">Any Duration</option>
                  <option value="Short">Short (1-3 Days)</option>
                  <option value="Medium">Medium (4-7 Days)</option>
                  <option value="Long">Long (8+ Days)</option>
                </select>
              </div>

              {/* Max Budget Filter */}
              <div style={{ marginBottom: "30px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                  <label style={{ fontWeight: "bold", color: "#334155" }}>💰 Max Budget</label>
                  <span style={{ color: "#16a34a", fontWeight: "bold" }}>₹{maxBudget.toLocaleString()}</span>
                </div>
                <input type="range" min="10000" max="300000" step="5000" value={maxBudget} onChange={(e) => setMaxBudget(Number(e.target.value))} style={{ width: "100%", cursor: "pointer" }} />
              </div>

              {/* Minimum Rating Filter */}
              <div style={{ marginBottom: "30px" }}>
                <label style={{ display: "block", marginBottom: "10px", fontWeight: "bold", color: "#334155" }}>⭐ Minimum Rating</label>
                <select value={minRating} onChange={(e) => setMinRating(Number(e.target.value))} style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "15px", outline: "none", background: "#f8fafc" }}>
                  <option value="0">Any Rating</option>
                  <option value="3">3+ Stars</option>
                  <option value="4">4+ Stars</option>
                  <option value="4.8">4.8+ Stars</option>
                </select>
              </div>

              <button 
                onClick={() => setIsFilterOpen(false)} 
                style={{ width: "100%", padding: "16px", background: "#2563eb", color: "white", borderRadius: "10px", fontWeight: "bold", fontSize: "16px", border: "none", marginTop: "20px", cursor: "pointer", transition: "all 0.2s", boxShadow: "0 4px 12px rgba(37, 99, 235, 0.3)" }}
                onMouseOver={(e) => { e.currentTarget.style.background = "#1d4ed8"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                onMouseOut={(e) => { e.currentTarget.style.background = "#2563eb"; e.currentTarget.style.transform = "translateY(0)"; }}
              >
                Show Results
              </button>

            </div>
          </div>
        )}

        {processedPackages.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 20px", background: "white", borderRadius: "16px", border: "1px dashed #cbd5e1" }}>
            <span style={{ fontSize: "50px" }}>🏝️</span>
            <h3 style={{ color: "#1e293b", margin: "15px 0 10px 0" }}>No destinations found</h3>
            <p style={{ color: "#64748b" }}>Try adjusting your budget slider or clearing your search filters.</p>
          </div>
        ) : (
          <div className="card-container" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "30px" }}>
            {processedPackages.map((pkg) => (
              <div
                key={pkg.id}
                onClick={() => openDetails(pkg)}
                style={{ cursor: "pointer", transition: "transform 0.2s", display: "flex", flexDirection: "column" }}
                onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-5px)"}
                onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}
              >
                <Card
                  id={pkg.id}
                  title={pkg.title}
                  price={pkg.price}
                  image={pkg.image}
                  duration_days={pkg.duration_days}
                  is_international={pkg.is_international}
                  discounted_price={pkg.discounted_price}
                  offer_name={pkg.offer_name}
                  discount_percentage={pkg.discount_percentage}
                  average_rating={Number(pkg.average_rating) || 0}
                  review_count={Number(pkg.review_count) || 0}
                />
              </div>
            ))}
          </div>
        )}

        {/* DETAILS MODAL */}
        {isModalOpen && selectedPackage && (
          <div
            className="modal-overlay"
            style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}
            onClick={() => setIsModalOpen(false)}
          >
            <div
              className="modal-box"
              style={{ background: 'white', borderRadius: '16px', width: '100%', maxWidth: '450px', overflow: 'hidden', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ position: "relative", width: "100%", height: "220px" }}>
                {selectedPackage.discount_percentage && (
                  <div style={{ position: "absolute", top: "12px", left: "12px", background: "#ef4444", color: "white", padding: "4px 12px", borderRadius: "20px", fontWeight: "bold", fontSize: "13px", zIndex: 10 }}>
                    🔥 {selectedPackage.discount_percentage}% OFF
                  </div>
                )}
                <img src={selectedPackage.image} alt={selectedPackage.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>

              <div style={{ padding: '25px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <h2 style={{ fontSize: '24px', color: '#1e293b', margin: 0, fontWeight: "800" }}>{selectedPackage.title}</h2>
                  <span style={{ fontSize: '12px', background: '#f1f5f9', color: '#64748b', padding: '4px 8px', borderRadius: '6px', fontWeight: 'bold' }}>
                    ID: #{selectedPackage.id}
                  </span>
                </div>

                {selectedPackage.duration_days && (
                  <p style={{ margin: "0 0 10px 0", color: "#64748b", fontSize: "14px", fontWeight: "600" }}>⏱️ {selectedPackage.duration_days}</p>
                )}

                <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
                  <h3 style={{ color: '#16a34a', fontSize: '24px', margin: 0, fontWeight: "800" }}>
                    ₹{selectedPackage.discounted_price ? Math.round(selectedPackage.discounted_price).toLocaleString() : selectedPackage.price.toLocaleString()}
                  </h3>
                  {selectedPackage.discounted_price && Number(selectedPackage.discounted_price) < Number(selectedPackage.price) && (
                    <span style={{ textDecoration: 'line-through', color: '#94a3b8', fontSize: '15px' }}>
                      ₹{selectedPackage.price.toLocaleString()}
                    </span>
                  )}
                </div>

                {selectedPackage.offer_name && (
                  <p style={{ color: "#d97706", fontWeight: "600", margin: "8px 0 0 0", fontSize: "13px", background: "#fffbeb", display: "inline-block", padding: "4px 8px", borderRadius: "4px" }}>
                    ✨ {selectedPackage.offer_name}
                  </p>
                )}

                <hr style={{ margin: '15px 0', borderColor: '#e2e8f0', borderTop: "1px solid" }} />

                <p style={{ marginTop: '10px', fontWeight: 'bold', color: '#334155' }}>Trip Highlights:</p>
                <ul style={{ paddingLeft: '20px', color: '#64748b', fontSize: '14px', marginTop: '8px', lineHeight: '1.6' }}>
                  <li>Premium Hotel Accommodations</li>
                  <li>Daily Breakfast & Dinner</li>
                  <li>Guided Sightseeing Tours</li>
                  <li>Airport/Station Transfers</li>
                </ul>

                <div style={{ display: 'flex', gap: '10px', marginTop: '25px' }}>
                  <button
                    onClick={() => { setIsModalOpen(false); router.push(`/packages/${selectedPackage.id}`); }}
                    style={{ flex: 1, padding: '12px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold', fontSize: "15px" }}
                  >
                    View Full Details
                  </button>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    style={{ flex: 1, padding: '12px', background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold', fontSize: "15px" }}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </main>
  );
}

export default function PackagesPage() {
  return (
    <Suspense fallback={<div style={{ textAlign: "center", padding: "100px", color: "#64748b", fontWeight: "bold" }}>Loading Page...</div>}>
      <PackagesContent />
    </Suspense>
  );
}