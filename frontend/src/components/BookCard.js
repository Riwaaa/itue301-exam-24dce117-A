import { Link } from "react-router-dom";
import "../styles/BookCard.css";

/**
 * BookCard (Task 1)
 * Props: title, author, category, available, coverImage, borrowedBy
 * The availability status is styled differently for true / false.
 * When available, the Borrow button links to /borrow and passes the
 * title in the query string so the form pre-selects that book.
 */
function BookCard({ title, author, category, available, coverImage, borrowedBy }) {
  const statusClass = available ? "is-available" : "is-unavailable";
  const statusText = available ? "Available" : "Not Available";

  return (
    <article className="card">
      <div className="card-media">
        <span className={`card-pill ${statusClass}`}>
          <span className="dot" />
          {statusText}
        </span>

        <img className="card-img" src={coverImage} alt={title} loading="lazy" />
      </div>

      <div className="card-body">
        <span className="card-cat">{category}</span>
        <h3 className="card-title">{title}</h3>
        <p className="card-author">{author}</p>

        <div className="card-foot">
          <span className={`card-status ${statusClass}`}>
            {available ? statusText : borrowedBy ? `Borrowed by ${borrowedBy}` : statusText}
          </span>

          {available ? (
            <Link className="card-btn" to={`/borrow?book=${encodeURIComponent(title)}`}>
              Borrow
            </Link>
          ) : (
            <button className="card-btn is-disabled" disabled>
              On loan
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

export default BookCard;
