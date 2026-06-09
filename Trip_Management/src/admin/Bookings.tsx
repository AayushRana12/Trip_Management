import { useEffect, useState } from "react";
import "../assets/styles/admin.css";

type Booking = {
  name: string;
  email: string;
  date: string;
  people: number;
};

export default function Bookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("bookings") || "[]");
    setBookings(data);
  }, []);

  const handleDelete = (index: number) => {
    const updated = bookings.filter((_, i) => i !== index);
    setBookings(updated);
    localStorage.setItem("bookings", JSON.stringify(updated));
  };

  return (
    <div className="admin-dashboard">
      <h2>Manage Bookings</h2>

      {bookings.length === 0 ? (
        <p>No bookings available</p>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Date</th>
              <th>People</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {bookings.map((b, index) => (
              <tr key={index}>
                <td>{b.name}</td>
                <td>{b.email}</td>
                <td>{b.date}</td>
                <td>{b.people}</td>
                <td>
                  <button
                    className="delete-btn"
                    onClick={() => handleDelete(index)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}