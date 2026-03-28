import "../../assets/styles/card.css";
import { useNavigate } from "react-router-dom";

type CardProps = {
  title: string;
  price: number;
  image: string;
};

export default function Card({ title, price, image }: CardProps) {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user") || "null");

  const handleClick = () => {
    if (!user) {
      alert("Please login to continue 🚫");
      navigate("/login");
      return;
    }

    navigate(`/package/${title}`, {
      state: { title, price, image },
    });
  };

  return (
    <div className="card">
      <img src={image} alt={title} />

      <div className="card-content">
        <h3>{title}</h3>
        <p>₹{price}</p>

        <button className="btn" onClick={handleClick}>
          View Details
        </button>
      </div>
    </div>
  );
}