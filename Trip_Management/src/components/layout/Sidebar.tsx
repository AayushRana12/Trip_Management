import { Link } from "react-router-dom";

export default function Sidebar() {
  return (
    <div className="sidebar">
      <h3>Dashboard</h3>

      <ul>
        <li><Link to="/dashboard">My Trips</Link></li>
        <li><Link to="/booking">Book Trip</Link></li>
        <li><Link to="/profile">Profile</Link></li>
      </ul>

      <h4>Admin</h4>
      <ul>
        <li><Link to="/admin">Admin Dashboard</Link></li>
        <li><Link to="/admin/packages">Manage Packages</Link></li>
        <li><Link to="/admin/users">Manage Users</Link></li>
      </ul>
    </div>
  );}
