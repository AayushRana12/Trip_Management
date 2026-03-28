import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../assets/styles/booking.css";

export default function Booking() {
  const navigate = useNavigate();
  const location = useLocation();

  const user = JSON.parse(localStorage.getItem("user") || "null");
  const pkg = location.state;

  // 🔒 Protect route
  if (!user) {
    navigate("/login");
    return null;
  }

  if (!pkg) {
    return <h2 style={{ textAlign: "center" }}>No package selected 😔</h2>;
  }

  const [name, setName] = useState("");
  const [email] = useState(user.email || "");
  const [date, setDate] = useState("");
  const [people, setPeople] = useState(1);

  const handleBooking = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !email || !date) {
      alert("Please fill all fields");
      return;
    }

    const booking = {
      name,
      email,
      date,
      people,
      package: pkg.title,
      price: pkg.price,
    };

    const existing = JSON.parse(localStorage.getItem("bookings") || "[]");
    localStorage.setItem("bookings", JSON.stringify([...existing, booking]));

    alert("Booking Successful 🎉");
    navigate("/dashboard");
  };

  return (
    <div className="booking-container">

      {/* Package Preview */}
      <div className="booking-preview">
        <img src={pkg.image} alt={pkg.title} />
        <h3>{pkg.title}</h3>
        <p>₹{pkg.price}</p>
      </div>

      {/* Form */}
      <form className="booking-form" onSubmit={handleBooking}>
        <h2>Book Your Trip</h2>

        <input
          type="text"
          placeholder="Your Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          type="email"
          value={email}
          disabled
        />

        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />

        <input
          type="number"
          min="1"
          value={people}
          onChange={(e) => setPeople(Number(e.target.value))}
        />

        <button type="submit">Confirm Booking</button>
      </form>
    </div>
  );
}