import { useNavigate } from "react-router-dom";
import "../assets/styles/notfound.css";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="notfound">
      <h1>404</h1>
      <h2>Page Not Found</h2>
      <p>The page you are looking for does not exist.</p>

      <button onClick={() => navigate("/")}>
        Go Back Home
      </button>
    </div>
  );
}