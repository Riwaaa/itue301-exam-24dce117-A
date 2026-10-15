import { Link, useLocation } from "react-router-dom";
import "../styles/Navbar.css";

function Navbar() {
  const { pathname } = useLocation();

  // small helper so the current route gets the "active" class
  const linkClass = (path) => (pathname === path ? "nav-link active" : "nav-link");

  return (
    <nav className="nav">
      <div className="container nav-inner">
        <Link to="/" className="brand">
          <span className="brand-mark">L</span>
          <span>Library</span>
        </Link>

        <div className="nav-links">
          <Link to="/" className={linkClass("/")}>Home</Link>
          <Link to="/books" className={linkClass("/books")}>Books</Link>
          <Link to="/borrow" className={linkClass("/borrow")}>Borrow</Link>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
