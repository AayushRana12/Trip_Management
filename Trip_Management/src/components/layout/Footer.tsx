import "../../assets/styles/footer.css";

export default function Footer() {
  return (
    <footer className="footer">
      <p>© 2026 TripManager. All rights reserved.</p>

      <div className="footer-links">
        <a href="/about">About</a>
        <a href="/contact">Contact</a>
        <a href="#">Privacy</a>
      </div>
    </footer>
  );
}