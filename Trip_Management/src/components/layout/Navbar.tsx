import { Link, useNavigate } from "react-router-dom";
import "../../assets/styles/navbar.css";

export default function Navbar() {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user") || "null");

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <div className="container navbar-content">
        
        {/* Logo */}
        <h2 className="logo">TripManager</h2>

        {/* Links */}
        <div className="nav-links">
          <Link to="/">Home</Link>
          <Link to="/destinations">Destinations</Link>
          <Link to="/packages">Packages</Link>

          {user && <Link to="/dashboard">Dashboard</Link>}
        </div>

        {/* Auth */}
        <div className="nav-auth">
          {user ? (
            <>
              <span className="user-email">{user.email}</span>
              <button className="logout-btn" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="login">Login</Link>
              <Link to="/signup" className="signup">Sign Up</Link>
            </>
          )}
        </div>

      </div>
    </nav>
  );
}