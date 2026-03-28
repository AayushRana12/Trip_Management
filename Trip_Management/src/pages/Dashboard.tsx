import { useEffect, useState } from "react";
import "../assets/styles/dashboard.css";

type Booking = {
  name: string;
  email: string;
  date: string;
  people: number;
};

export default function Dashboard() {
  const [bookings, setBookings] = useState<Booking[]>([]);

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("bookings") || "[]");
    setBookings(data);
  }, []);

  return (
    <div className="dashboard-page">
      <h2>My Dashboard</h2>

      {/* No Bookings */}
      {bookings.length === 0 ? (
        <p>No bookings yet 😔</p>
      ) : (
        <div className="card-container">
          {bookings.map((b, index) => (
            <div className="card" key={index}>
              <h3>{b.name}</h3>
              <p>Email: {b.email}</p>
              <p>Date: {b.date}</p>
              <p>People: {b.people}</p>
              <p>Status: Confirmed ✅</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}