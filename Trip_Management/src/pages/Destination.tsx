import Card from "../components/ui/Card";
import { destinations } from "../data/destination";
import "../assets/styles/destinations.css";

export default function Destinations() {
  return (
    <div className="destinations-page">
      <h2>Popular Destinations</h2>

      <div className="card-container">
        {destinations.map((dest) => (
          <Card
            key={dest.id}
            title={dest.title}
            price={dest.price}
            image={dest.image}
          />
        ))}
      </div>
    </div>
  );
}