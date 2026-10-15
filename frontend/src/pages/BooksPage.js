import { useState, useEffect } from "react";
import BookCard from "../components/BookCard";
import "../styles/BooksPage.css";

const API_URL = "http://localhost:5000/api/v1/books";

function BooksPage() {
  // Task 4 — the three required states
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // extra UI state (filter + search)
  const [category, setCategory] = useState("All");
  const [query, setQuery] = useState("");

  // Task 4 — fetch on mount using the async pattern
  useEffect(() => {
    const fetchBooks = async () => {
      try {
        setLoading(true);
        const res = await fetch(API_URL);
        if (!res.ok) throw new Error(`Request failed with status ${res.status}`);
        const json = await res.json();
        setData(json.data);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, []);

  const categories = ["All", ...new Set(data.map((b) => b.category))];

  const visible = data
    .filter((b) => category === "All" || b.category === category)
    .filter((b) => {
      const text = `${b.title} ${b.author}`.toLowerCase();
      return text.includes(query.trim().toLowerCase());
    });

  // 1 — loading
  if (loading) {
    return (
      <div className="container page">
        <div className="section-head">
          <h2>Books</h2>
          <p>Loading the catalogue&hellip;</p>
        </div>
        <div className="skeleton-grid">
          {Array.from({ length: 8 }).map((_, i) => (
            <div className="skeleton" key={i}>
              <div className="skeleton-media" />
              <div className="skeleton-line" />
              <div className="skeleton-line short" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 2 — error
  if (error) {
    return (
      <div className="container page">
        <div className="section-head">
          <h2>Books</h2>
        </div>
        <div className="state is-error">
          <p className="state-title">Could not load books</p>
          <p className="state-text">{error}</p>
          <p className="state-text">
            Make sure the backend is running on http://localhost:5000
          </p>
        </div>
      </div>
    );
  }

  // 3 — success
  return (
    <div className="container page rise">
      <div className="section-head">
        <h2>Books</h2>
        <p>{data.length} titles in the library catalogue.</p>
      </div>

      <div className="books-toolbar">
        <div className="filters">
          {categories.map((cat) => (
            <button
              key={cat}
              className={category === cat ? "chip active" : "chip"}
              onClick={() => setCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        <input
          className="search"
          type="text"
          placeholder="Search title or author"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {visible.length === 0 ? (
        <div className="state">
          <p className="state-title">No books match</p>
          <p className="state-text">Try a different category or search term.</p>
        </div>
      ) : (
        <>
          <div className="books-grid">
            {visible.map((book) => (
              <BookCard
                key={book._id}
                title={book.title}
                author={book.author}
                category={book.category}
                available={book.available}
                coverImage={book.coverImage}
                borrowedBy={book.borrowedBy}
              />
            ))}
          </div>
          <p className="count-note" style={{ marginTop: "18px" }}>
            Showing {visible.length} of {data.length} &middot; hover a cover to flip the image
          </p>
        </>
      )}
    </div>
  );
}

export default BooksPage;
