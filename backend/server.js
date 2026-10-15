const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const mongoose = require("mongoose");

dotenv.config({ path: "../.env" });

const books = require("./data/books");
const Book = require("./models/Book");
const Member = require("./models/Member");
const Borrowing = require("./models/Borrowing");

const app = express();
const PORT = process.env.PORT || 5000;

// ─────────────────────────────────────────────
// Global middleware
// ─────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// Custom requestLogger middleware -> [METHOD] [PATH] [TIMESTAMP]
const requestLogger = (req, res, next) => {
  console.log(`[${req.method}] ${req.path} [${new Date().toISOString()}]`);
  next();
};
app.use(requestLogger);

// In-memory borrowing records (Task 3)
let borrowings = [];

// ─────────────────────────────────────────────
// Task 3 — REST API (in-memory)
// ─────────────────────────────────────────────

// GET /api/v1/books -> all books
app.get("/api/v1/books", (req, res) => {
  res.status(200).json({ success: true, count: books.length, data: books });
});

// GET /api/v1/borrowings -> all borrowing records
app.get("/api/v1/borrowings", (req, res) => {
  res.status(200).json({ success: true, count: borrowings.length, data: borrowings });
});

// POST /api/v1/borrowings -> create a borrowing record
app.post("/api/v1/borrowings", (req, res) => {
  const { memberId, bookId, borrowDate, returnDate, status } = req.body;

  if (!memberId || !bookId || !borrowDate || !returnDate) {
    return res.status(400).json({
      success: false,
      error: "Validation Failed",
      messages: ["memberId, bookId, borrowDate and returnDate are required"]
    });
  }

  const allowed = ["borrowed", "returned", "overdue"];
  if (status && !allowed.includes(status)) {
    return res.status(400).json({
      success: false,
      error: "Validation Failed",
      messages: [`status must be one of: ${allowed.join(", ")}`]
    });
  }

  // the bookId must match a real book
  const book = books.find((b) => b._id === bookId || b.title === bookId);
  if (!book) {
    return res.status(400).json({
      success: false,
      error: "Validation Failed",
      messages: [`No book found for bookId '${bookId}'`]
    });
  }

  // a book that is already on loan cannot be borrowed again
  if (!book.available) {
    return res.status(409).json({
      success: false,
      error: "Book Unavailable",
      messages: [`'${book.title}' is already borrowed by ${book.borrowedBy}`]
    });
  }

  const newBorrowing = {
    _id: String(borrowings.length + 1),
    memberId,
    bookId: book._id,
    bookTitle: book.title,
    borrowDate,
    returnDate,
    status: status || "borrowed"
  };

  borrowings.push(newBorrowing);

  // update the book so the catalogue reflects the new status
  book.available = false;
  book.borrowedBy = memberId;

  res.status(201).json({ success: true, message: "Borrowing record created", data: newBorrowing });
});

// PATCH /api/v1/borrowings/:id/return -> mark returned and free the book
app.patch("/api/v1/borrowings/:id/return", (req, res) => {
  const record = borrowings.find((b) => b._id === req.params.id);
  if (!record) {
    return res.status(404).json({ success: false, error: "Borrowing record not found" });
  }

  record.status = "returned";

  const book = books.find((b) => b._id === record.bookId);
  if (book) {
    book.available = true;
    book.borrowedBy = null;
  }

  res.status(200).json({ success: true, message: "Book returned", data: record });
});

// Route to prove the global error handler works (500)
app.get("/api/v1/error-demo", (req, res, next) => {
  next(new Error("This is a deliberate server error"));
});

// ─────────────────────────────────────────────
// Task 5 — MongoDB + Mongoose routes
// ─────────────────────────────────────────────

// Books in MongoDB
app.get("/api/v1/db/books", async (req, res, next) => {
  try {
    const docs = await Book.find();
    res.status(200).json({ success: true, count: docs.length, data: docs });
  } catch (err) { next(err); }
});

app.post("/api/v1/db/books", async (req, res, next) => {
  try {
    const book = await Book.create(req.body);
    res.status(201).json({ success: true, message: "Book created", data: book });
  } catch (err) { next(err); }
});

// Members in MongoDB
app.get("/api/v1/db/members", async (req, res, next) => {
  try {
    const docs = await Member.find();
    res.status(200).json({ success: true, count: docs.length, data: docs });
  } catch (err) { next(err); }
});

app.post("/api/v1/db/members", async (req, res, next) => {
  try {
    const member = await Member.create(req.body);
    res.status(201).json({ success: true, message: "Member created", data: member });
  } catch (err) { next(err); }
});

// Borrowings in MongoDB (with populated references)
app.get("/api/v1/db/borrowings", async (req, res, next) => {
  try {
    const docs = await Borrowing.find()
      .populate("memberId", "name email department")
      .populate("bookId", "title author category");
    res.status(200).json({ success: true, count: docs.length, data: docs });
  } catch (err) { next(err); }
});

app.post("/api/v1/db/borrowings", async (req, res, next) => {
  try {
    const borrowing = await Borrowing.create(req.body);
    res.status(201).json({ success: true, message: "Borrowing record created", data: borrowing });
  } catch (err) { next(err); }
});

// ─────────────────────────────────────────────
// 404 handler
// ─────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, error: "Route not found", path: req.originalUrl });
});

// ─────────────────────────────────────────────
// Global error-handling middleware (LAST)
// Returns structured JSON, never the raw stack
// ─────────────────────────────────────────────
app.use((err, req, res, next) => {
  // Mongoose validation error
  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ success: false, error: "Validation Failed", messages });
  }

  // Invalid ObjectId
  if (err.name === "CastError") {
    return res.status(400).json({
      success: false,
      error: "Invalid Value",
      messages: [`'${err.value}' is not a valid ${err.path}`]
    });
  }

  // Duplicate unique field
  if (err.code === 11000) {
    return res.status(400).json({
      success: false,
      error: "Duplicate Value",
      messages: [`${Object.keys(err.keyValue).join(", ")} already exists`]
    });
  }

  console.error("Unhandled error:", err.message);
  res.status(500).json({ success: false, error: "Internal Server Error", message: err.message });
});

// ─────────────────────────────────────────────
// Connect MongoDB, then start server
// ─────────────────────────────────────────────
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.log("MongoDB connection failed:", err.message);
    app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT} (without MongoDB)`));
  });
