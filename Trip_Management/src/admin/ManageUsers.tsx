import { useEffect, useState } from "react";
import "../assets/styles/admin.css";

type User = {
  email: string;
  role: string;
};

export default function ManageUsers() {
  const [users, setUsers] = useState<User[]>([]);

  // ✅ Load users from localStorage
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("users") || "[]");
    setUsers(stored);
  }, []);

  // ❌ Delete user
  const handleDelete = (email: string) => {
    const updated = users.filter((u) => u.email !== email);

    setUsers(updated);
    localStorage.setItem("users", JSON.stringify(updated));
  };

  return (
    <div className="admin-dashboard">
      <h2>Manage Users</h2>

      <table className="admin-table">
        <thead>
          <tr>
            <th>Email</th>
            <th>Role</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {users.length > 0 ? (
            users.map((user, index) => (
              <tr key={index}>
                <td>{user.email}</td>
                <td>{user.role}</td>
                <td>
                  <button
                    className="delete-btn"
                    onClick={() => handleDelete(user.email)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={3}>No users found</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}