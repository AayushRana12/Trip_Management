import { useEffect, useState } from "react";
import "../assets/styles/admin.css";

export default function AdminDashboard() {
  const [users, setUsers] = useState(0);
  const [bookings, setBookings] = useState(0);
  const [packages, setPackages] = useState(0);

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("users") || "[]");
    const bookingData = JSON.parse(localStorage.getItem("bookings") || "[]");

    setUsers(userData.length);
    setBookings(bookingData.length);
    setPackages(3); // static for now
  }, []);

  return (
    <div className="admin-dashboard">
      <h2>Admin Dashboard</h2>

      <div className="admin-cards">
        <div className="admin-card">
          <h3>Total Users</h3>
          <p>{users}</p>
        </div>

        <div className="admin-card">
          <h3>Total Bookings</h3>
          <p>{bookings}</p>
        </div>

        <div className="admin-card">
          <h3>Total Packages</h3>
          <p>{packages}</p>
        </div>
      </div>
    </div>
  );
}