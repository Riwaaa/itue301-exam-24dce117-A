import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import "../styles/BorrowPage.css";

const BOOKS_URL = "http://localhost:5000/api/v1/books";
const BORROW_URL = "http://localhost:5000/api/v1/borrowings";

function BorrowPage() {
  // the Borrow button on a book card sends ?book=<title>
  const [searchParams] = useSearchParams();

  // Task 2 — form state with useState (controlled inputs)
  const [memberName, setMemberName] = useState("");
  const [bookTitle, setBookTitle] = useState(searchParams.get("book") || "");
  const [borrowDate, setBorrowDate] = useState("");
  const [returnDate, setReturnDate] = useState("");

  // books for the dropdown + preview thumbnail
  const [books, setBooks] = useState([]);
  const [saved, setSaved] = useState(null);
  const [formError, setFormError] = useState("");

  // load the book list so the dropdown is filled from the API
  const loadBooks = async () => {
    try {
      const res = await fetch(BOOKS_URL);
      const json = await res.json();
      setBooks(json.data);
    } catch {
      setBooks([]);
    }
  };

  useEffect(() => {
    loadBooks();
  }, []);

  const selectedBook = books.find((b) => b.title === bookTitle);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    setSaved(null);

    if (!memberName || !bookTitle || !borrowDate || !returnDate) {
      setFormError("All four fields are required.");
      return;
    }

    if (new Date(returnDate) < new Date(borrowDate)) {
      setFormError("Return date cannot be before the borrow date.");
      return;
    }

    try {
      const res = await fetch(BORROW_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          memberId: memberName,
          bookId: selectedBook ? selectedBook._id : bookTitle,
          borrowDate,
          returnDate,
          status: "borrowed"
        })
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.messages ? json.messages[0] : json.error);

      setSaved(json.data);
      await loadBooks(); // refresh so the book now shows as on loan
    } catch (err) {
      setFormError(err.message);
    }
  };

  const handleReset = () => {
    setMemberName("");
    setBookTitle("");
    setBorrowDate("");
    setReturnDate("");
    setSaved(null);
    setFormError("");
  };

  return (
    <div className="container page rise">
      <div className="section-head">
        <h2>Borrow a book</h2>
        <p>Fill in the details to create a borrowing record.</p>
      </div>

      <div className="borrow-layout">
        <div className="panel">
          <p className="panel-title">Borrowing details</p>

          {/* preview updates when the selected book state changes */}
          {selectedBook && (
            <div className="preview">
              <div className="preview-thumb">
                <img src={selectedBook.coverImage} alt={selectedBook.title} />
              </div>
              <div>
                <p className="preview-title">{selectedBook.title}</p>
                <p className="preview-author">{selectedBook.author}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="field">
              <label htmlFor="member">Member name</label>
              <input
                id="member"
                type="text"
                placeholder="e.g. Aarav Patel"
                value={memberName}
                onChange={(e) => setMemberName(e.target.value)}
              />
            </div>

            <div className="field">
              <label htmlFor="book">Book title</label>
              <select
                id="book"
                value={bookTitle}
                onChange={(e) => setBookTitle(e.target.value)}
              >
                <option value="">Select a book</option>
                {books.map((b) => (
                  <option key={b._id} value={b.title} disabled={!b.available}>
                    {b.title} {b.available ? "" : "(on loan)"}
                  </option>
                ))}
              </select>
            </div>

            <div className="field-row">
              <div className="field">
                <label htmlFor="from">Borrow date</label>
                <input
                  id="from"
                  type="date"
                  value={borrowDate}
                  onChange={(e) => setBorrowDate(e.target.value)}
                />
              </div>
              <div className="field">
                <label htmlFor="to">Return date</label>
                <input
                  id="to"
                  type="date"
                  value={returnDate}
                  onChange={(e) => setReturnDate(e.target.value)}
                />
              </div>
            </div>

            {/* one live value shown on the page as the state changes */}
            <p className="live-line">
              {memberName || bookTitle
                ? `${memberName || "—"} · ${bookTitle || "no book selected"}`
                : "Your entries will appear here as you type"}
            </p>

            <button
              type="submit"
              className="btn"
              style={{ width: "100%", justifyContent: "center" }}
            >
              Submit request
            </button>
          </form>

          {formError && <p className="error-note">{formError}</p>}

          {saved && (
            <div className="success">
              <p className="success-title">Borrowing record created</p>
              <p className="success-text">
                Record #{saved._id} &middot; {saved.bookTitle} is now marked as borrowed by{" "}
                {saved.memberId}
              </p>
              <button className="btn btn-ghost" style={{ marginTop: "12px" }} onClick={handleReset}>
                New request
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default BorrowPage;
