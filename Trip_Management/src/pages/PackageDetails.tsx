import { useLocation, useNavigate } from "react-router-dom";
import "../assets/styles/packageDetails.css";

export default function PackageDetails() {
  const location = useLocation();
  const navigate = useNavigate();

  const pkg = location.state;

  if (!pkg) {
    return <h2 style={{ textAlign: "center" }}>No Package Found 😔</h2>;
  }

  return (
    <div className="details-container">
      <div className="details-card">
        <img src={pkg.image} alt={pkg.title} />

        <div className="details-info">
          <h2>{pkg.title}</h2>
          <p className="price">₹{pkg.price}</p>

          <p>
            Experience an unforgettable trip to <b>{pkg.title}</b> with
            premium stays, scenic views, and guided tours.
          </p>

          <ul>
            <li>✔ 3 Nights / 4 Days</li>
            <li>✔ Hotel Included</li>
            <li>✔ Free Breakfast</li>
            <li>✔ Sightseeing</li>
          </ul>

          <button
            onClick={() =>
              navigate("/booking", {
                state: pkg,
              })
            }
          >
            Book Now
          </button>
        </div>
      </div>
    </div>
  );
}