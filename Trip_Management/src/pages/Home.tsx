import { useEffect, useState } from "react";
import Card from "../components/ui/Card";
import "../assets/styles/home.css";
import { packages as initialPackages } from "../data/packages";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();
  const [packages, setPackages] = useState<any[]>([]);

  // ✅ Load from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("packages");

    if (stored) {
      setPackages(JSON.parse(stored));
    } else {
      localStorage.setItem("packages", JSON.stringify(initialPackages));
      setPackages(initialPackages);
    }
  }, []);

  return (
    <>
      {/* 🌄 HERO SECTION */}
      <section className="hero">
        <div className="hero-content">
          <h1>Plan Your Dream Trip ✈️</h1>
          <p>Discover amazing destinations at best prices</p>

          <button onClick={() => navigate("/packages")}>
            Explore Packages
          </button>
        </div>
      </section>

      {/* 📦 FEATURED PACKAGES */}
      <section className="section">
        <div className="container">
          <h2 className="page-title">Featured Packages</h2>

          <div className="card-container">
            {packages.length > 0 ? (
              packages.slice(0, 3).map((pkg) => (
                <Card
                  key={pkg.id}
                  title={pkg.title}
                  price={pkg.price}
                  image={pkg.image}
                />
              ))
            ) : (
              <p>No packages available 😔</p>
            )}
          </div>

          {/* 👉 View More Button */}
          <div className="view-more">
            <button onClick={() => navigate("/packages")}>
              View All Packages
            </button>
          </div>
        </div>
      </section>
    </>
  );
}