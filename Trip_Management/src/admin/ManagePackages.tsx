import { useEffect, useState } from "react";
import { packages as initialPackages } from "../data/packages";
import "../assets/styles/admin.css";

type Package = {
  id: number;
  title: string;
  price: number;
  image: string;
};

export default function ManagePackages() {
  const [packages, setPackages] = useState<Package[]>([]);

  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState("");

  // ✅ Load packages from localStorage or fallback
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("packages") || "null");

    if (stored && stored.length > 0) {
      setPackages(stored);
    } else {
      setPackages(initialPackages);
      localStorage.setItem("packages", JSON.stringify(initialPackages));
    }
  }, []);

  // ➕ Add Package
  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !price || !image) {
      alert("Fill all fields");
      return;
    }

    const newPackage: Package = {
      id: Date.now(),
      title,
      price: Number(price),
      image,
    };

    const updated = [...packages, newPackage];

    setPackages(updated);

    // ✅ Save to localStorage
    localStorage.setItem("packages", JSON.stringify(updated));

    // Clear inputs
    setTitle("");
    setPrice("");
    setImage("");
  };

  // ❌ Delete Package
  const handleDelete = (id: number) => {
    const updated = packages.filter((p) => p.id !== id);

    setPackages(updated);

    // ✅ Update localStorage
    localStorage.setItem("packages", JSON.stringify(updated));
  };

  return (
    <div className="admin-dashboard">
      <h2>Manage Packages</h2>

      {/* ➕ Add Form */}
      <form className="admin-form" onSubmit={handleAdd}>
        <input
          type="text"
          placeholder="Package Name"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <input
          type="number"
          placeholder="Price"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />

        <input
          type="text"
          placeholder="Image URL"
          value={image}
          onChange={(e) => setImage(e.target.value)}
        />

        <button type="submit">Add Package</button>
      </form>

      {/* 📦 Package List */}
      <div className="card-container">
        {packages.map((p) => (
          <div className="card" key={p.id}>
            <img src={p.image} alt={p.title} />
            <h3>{p.title}</h3>
            <p>₹{p.price}</p>

            <button
              className="delete-btn"
              onClick={() => handleDelete(p.id)}
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}