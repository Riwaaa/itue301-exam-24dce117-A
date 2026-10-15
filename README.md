# Library Book Management System

ITUE301 — Advanced Web Development Frameworks · Open-Book Practical Examination (Set B)
Charotar University of Science and Technology · CSPIT-IT

Stack: **React** (frontend) · **Express.js** (backend) · **MongoDB with Mongoose** (database)

---

## Environment variables

Create a `.env` file in the project root (copy `.env.example`):

```
MONGO_URI=your_mongodb_connection_string
PORT=5000
```

## Run the backend

```bash
cd backend
npm install
npm start          # or: node server.js
```

Runs on **http://localhost:5000**. Every request is logged as `[GET] /api/v1/books [timestamp]`.

## Run the frontend

In a second terminal, with the backend already running:

```bash
cd frontend
npm install
npm start
```

Opens on **http://localhost:3000**.

---

## API endpoints

Base URL: `http://localhost:5000/api/v1`

All responses share the same shape:

```jsonc
{ "success": true,  "count": 10, "data": [ ... ] }                       // success
{ "success": false, "error": "Validation Failed", "messages": [ ... ] }  // error
```

| Method | Endpoint | Purpose | Data source |
|---|---|---|---|
| `GET` | `/api/v1/books` | List all books | In-memory |
| `GET` | `/api/v1/borrowings` | List all borrowing records | In-memory |
| `POST` | `/api/v1/borrowings` | Create a borrowing record, mark the book borrowed | In-memory |
| `PATCH` | `/api/v1/borrowings/:id/return` | Mark returned, free the book | In-memory |
| `GET` | `/api/v1/db/books` | List books | MongoDB |
| `POST` | `/api/v1/db/books` | Create a book | MongoDB |
| `GET` | `/api/v1/db/members` | List members | MongoDB |
| `POST` | `/api/v1/db/members` | Create a member | MongoDB |
| `GET` | `/api/v1/db/borrowings` | List borrowings with member and book populated | MongoDB |
| `POST` | `/api/v1/db/borrowings` | Create a borrowing | MongoDB |
| `GET` | `/api/v1/error-demo` | Throws on purpose, to show the error handler | — |

**Status codes**

| Code | When |
|---|---|
| `200` | Successful `GET` / `PATCH` |
| `201` | Successful `POST` |
| `400` | Validation failure, unknown `bookId`, invalid ObjectId, duplicate unique field |
| `404` | Unknown route or borrowing id |
| `409` | Borrowing a book that is already on loan |
| `500` | Unhandled server error |

**Sample — `POST /api/v1/borrowings`**

```json
{
  "memberId": "Het Patel",
  "bookId": "1",
  "borrowDate": "2026-08-20",
  "returnDate": "2026-08-30",
  "status": "borrowed"
}
```

Returns `201` with the created record, and sets the book's `available` to `false` and
`borrowedBy` to the member name.

**Sample — validation failure `POST /api/v1/db/books`** with `{ "author": "X" }`

```json
{
  "success": false,
  "error": "Validation Failed",
  "messages": ["Book title is required"]
}
```

---

## Mongoose schemas

| Book | Rules |
|---|---|
| `title` | String, required |
| `author` | String, required |
| `category` | String, required |
| `isbn` | String, unique |
| `available` | Boolean, default `true` |

| Member | Rules |
|---|---|
| `name` | String, required |
| `email` | String, required, unique |
| `phone` | String |
| `department` | String, required |

| Borrowing | Rules |
|---|---|
| `memberId` | ObjectId, `ref: "Member"` |
| `bookId` | ObjectId, `ref: "Book"` |
| `borrowDate` | Date, required |
| `returnDate` | Date, required |
| `status` | Enum `borrowed` / `returned` / `overdue`, default `borrowed` |

---

## File structure

```
itue301-exam-24dce091-A/
│
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── package.json
│   └── src/
│       ├── index.js                 # React entry point
│       ├── App.js                   # Routes: / /books /borrow
│       ├── components/
│       │   ├── Navbar.js            # React Router links
│       │   └── BookCard.js          # Reusable card driven by props
│       ├── pages/
│       │   ├── HomePage.js
│       │   ├── BooksPage.js         # Fetches books: loading / error / data
│       │   └── BorrowPage.js        # Controlled form with useState
│       └── styles/                  # All CSS, no inline styling
│           ├── global.css
│           ├── Navbar.css
│           ├── BookCard.css
│           ├── HomePage.css
│           ├── BooksPage.css
│           └── BorrowPage.css
│
├── backend/
│   ├── server.js                    # Express app, middleware, routes
│   ├── package.json
│   ├── data/
│   │   └── books.js                 # In-memory books list
│   └── models/
│       ├── Book.js
│       ├── Member.js
│       └── Borrowing.js
│
├── .env.example
├── .gitignore
└── README.md
```
