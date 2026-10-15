import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "../styles/HomePage.css";

function HomePage() {
  // books are only used for the cover strip / counters
  const [books, setBooks] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/api/v1/books")
      .then((res) => res.json())
      .then((json) => setBooks(json.data))
      .catch(() => setBooks([]));
  }, []);

  const total = books.length;
  const availableCount = books.filter((b) => b.available).length;
  const categories = new Set(books.map((b) => b.category)).size;

  return (
    <div className="rise">
      {/* ── Hero ── */}
      <header className="hero">
        <div className="container">
          <p className="eyebrow">Charotar University &middot; </p>
          <h1>
            Library Book
            <br />
            Management System
          </h1>
          <p className="hero-sub">
            A small, focused system to keep track of the library&rsquo;s books,
            members and borrowing records.
          </p>

          <div className="hero-actions">
            <Link to="/books" className="btn">Browse books</Link>
            <Link to="/borrow" className="btn btn-ghost">Borrow a book</Link>
          </div>

          {/* horizontal cover strip — scrolls smoothly */}
          {total > 0 && (
            <div className="strip">
              {books.map((book) => (
                <div className="strip-item" key={book._id} title={book.title}>
                  <img src={book.coverImage} alt={book.title} loading="lazy" />
                </div>
              ))}
            </div>
          )}
        </div>
      </header>

      {/* ── Stats ── */}
      <section className="container" style={{ paddingBottom: "96px" }}>
        <div className="section-head">
          <h2>At a glance</h2>
          <p>Live numbers pulled from the books API.</p>
        </div>

        <div className="stats">
          <div className="stat">
            <p className="stat-value">{total}</p>
            <p className="stat-label">Books in catalogue</p>
          </div>
          <div className="stat">
            <p className="stat-value">{availableCount}</p>
            <p className="stat-label">Currently available</p>
          </div>
          <div className="stat">
            <p className="stat-value">{total - availableCount}</p>
            <p className="stat-label">On loan</p>
          </div>
          <div className="stat">
            <p className="stat-value">{categories}</p>
            <p className="stat-label">Categories</p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default HomePage;
