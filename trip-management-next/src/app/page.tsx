"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import "@/assets/styles/home.css"; // ✅ Importing our clean CSS!

export default function HomePage() {
  const router = useRouter();
  const [featuredPackages, setFeaturedPackages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchDestination, setSearchDestination] = useState("");

  useEffect(() => {
    // This dynamically uses your live Render URL in production, or localhost if you are testing locally
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    
    fetch(`${API_URL}/api/packages`)
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
    <main className="home-main">

      {/* =========================================================
          1. HERO SECTION
          ========================================================= */}
      <section className="hero-section">
        <h1 className="hero-title">
          Discover Your Next <br/>
          <span className="hero-title-highlight">Great Adventure</span> 
        </h1>
        
        <p className="hero-subtitle">
          Curated itineraries, premium stays, and unforgettable experiences. Plan your dream trip with absolute confidence.
        </p>

        {/* The Sleek Search Bar */}
        <form onSubmit={handleSearch} className="search-form">
          <div className="search-input-wrapper">
            <svg className="search-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
              <circle cx="12" cy="10" r="3"></circle>
            </svg>
            <input 
              type="text" 
              className="search-input"
              placeholder="Where do you want to go?" 
              value={searchDestination}
              onChange={(e) => setSearchDestination(e.target.value)}
            />
          </div>
          <button type="submit" className="search-btn">
            Search
          </button>
        </form>
      </section>

      {/* =========================================================
          2. TRUST BADGES 
          ========================================================= */}
      <section className="trust-badges-section">
        <div className="trust-badges-container">
          
          <div className="trust-badge">
            <div className="badge-icon" style={{ background: "#eff6ff" }}>🔒</div>
            <div>
              <h4 className="badge-title">Secure Booking</h4>
              <p className="badge-desc">256-bit SSL encrypted</p>
            </div>
          </div>

          <div className="trust-badge">
            <div className="badge-icon" style={{ background: "#f0fdf4" }}>💵</div>
            <div>
              <h4 className="badge-title">Best Price</h4>
              <p className="badge-desc">Direct hotel deals</p>
            </div>
          </div>

          <div className="trust-badge">
            <div className="badge-icon" style={{ background: "#fffbeb" }}>✨</div>
            <div>
              <h4 className="badge-title">Premium Stays</h4>
              <p className="badge-desc">Verified luxury hotels</p>
            </div>
          </div>

          <div className="trust-badge">
            <div className="badge-icon" style={{ background: "#fef2f2" }}>🎧</div>
            <div>
              <h4 className="badge-title">24/7 Support</h4>
              <p className="badge-desc">Global concierge</p>
            </div>
          </div>

        </div>
      </section>

      {/* =========================================================
          3. FEATURED PACKAGES
          ========================================================= */}
      <section className="featured-section">
        <div className="section-header">
          <p className="section-subtitle">Explore The World</p>
          <h2 className="section-title">Trending Destinations</h2>
        </div>

        {loading ? (
          <div className="loading-text">Discovering amazing trips...</div>
        ) : (
          <>
            <div className="packages-grid">
              {featuredPackages.map((pkg) => (
                <div key={pkg.id} className="premium-card">
                  
                  <div className="card-image-wrapper">
                    <img src={pkg.image} alt={pkg.title} />
                    {pkg.is_international && (
                      <div className="intl-badge">
                        🌍 INTERNATIONAL
                      </div>
                    )}
                  </div>

                  <div className="card-body">
                    <div>
                      <h3 className="card-title">{pkg.title}</h3>
                      
                      {pkg.review_count && Number(pkg.review_count) > 0 ? (
                        <div className="card-reviews">
                          <span className="star-icon">★</span>
                          <span className="rating-val">{Number(pkg.average_rating).toFixed(1)}</span>
                          <span className="review-count">({pkg.review_count} review{Number(pkg.review_count) > 1 ? 's' : ''})</span>
                        </div>
                      ) : (
                        <div className="card-reviews">
                          <span className="star-icon">★</span>
                          <span className="rating-val">New</span>
                        </div>
                      )}
                      
                      {pkg.duration_days && (
                        <p className="card-duration">
                          ⏱️ {pkg.duration_days}
                        </p>
                      )}
                    </div>

                    <div>
                      <p className="card-price">
                        ₹{Number(pkg.price).toLocaleString()} <span className="price-suffix">/ person</span>
                      </p>

                      <div className="card-actions">
                        <Link href={`/packages/${pkg.id}`} className="btn-secondary">
                          View Details
                        </Link>
                        <Link href={`/packages/${pkg.id}`} className="btn-primary">
                          Book Now
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="view-all-container">
              <Link href="/packages" className="btn-view-all">
                View All Destinations 
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14"></path>
                  <path d="M12 5l7 7-7 7"></path>
                </svg>
              </Link>
            </div>
          </>
        )}
      </section>

    </main>
  );
}