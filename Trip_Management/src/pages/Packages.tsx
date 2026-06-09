import { useState, useEffect } from "react";
import Card from "../components/ui/Card";
import "../assets/styles/packages.css";

type Package = {
  id: number;
  title: string;
  price: number;
  image: string;
};

export default function Packages() {
  const [packages, setPackages] = useState<Package[]>([]);
  const [search, setSearch] = useState("");
  const [maxPrice, setMaxPrice] = useState(100000);
  const [sort, setSort] = useState("");

  // ✅ FETCH FROM FLASK BACKEND
  useEffect(() => {
    fetch("http://localhost:5000/api/packages")
      .then((res) => res.json())
      .then((data) => {
        console.log("API DATA:", data); // debug
        setPackages(data);
      })
      .catch((err) => {
        console.error("Error fetching packages:", err);
      });
  }, []);

  // 🔍 FILTER
  const filteredPackages = packages.filter(
    (pkg) =>
      pkg.title.toLowerCase().includes(search.toLowerCase()) &&
      pkg.price <= maxPrice
  );

  // 🔽 SORT
  const sortedPackages = [...filteredPackages].sort((a, b) => {
    if (sort === "low") return a.price - b.price;
    if (sort === "high") return b.price - a.price;
    return 0;
  });

  return (
    <div className="packages-page">
      <h2>All Travel Packages</h2>

      {/* 🔍 Filters */}
      <div className="filters">
        <input
          type="text"
          placeholder="Search packages..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <input
          type="range"
          min="1000"
          max="10000"
          value={maxPrice}
          onChange={(e) => setMaxPrice(Number(e.target.value))}
        />

        <p>Max Price: ₹{maxPrice}</p>

        <select value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="">Sort By</option>
          <option value="low">Price: Low → High</option>
          <option value="high">Price: High → Low</option>
        </select>
      </div>

      {/* 📦 Packages */}
      <div className="card-container">
        {sortedPackages.length > 0 ? (
          sortedPackages.map((pkg) => (
            <Card
              key={pkg.id}
              title={pkg.title}
              price={pkg.price}
              image={pkg.image}
            />
          ))
        ) : (
          <p>No packages found 😔</p>
        )}
      </div>
    </div>
  );
}