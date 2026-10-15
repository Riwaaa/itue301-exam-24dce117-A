// In-memory books list (Task 3).
// coverImage -> real book cover from Open Library (free, no API key needed)
// borrowedBy -> member name once the book has been borrowed, otherwise null

const makeCover = (isbn) =>
  `https://covers.openlibrary.org/b/isbn/${isbn.replace(/-/g, "")}-L.jpg`;

const rawBooks = [
  { _id: "1",  title: "The Great Gatsby",           author: "F. Scott Fitzgerald", category: "Fiction",    isbn: "978-0743273565", available: true  },
  { _id: "2",  title: "Clean Code",                 author: "Robert C. Martin",    category: "Technology", isbn: "978-0132350884", available: true  },
  { _id: "3",  title: "To Kill a Mockingbird",      author: "Harper Lee",          category: "Fiction",    isbn: "978-0061120084", available: false },
  { _id: "4",  title: "Introduction to Algorithms", author: "Thomas H. Cormen",    category: "Technology", isbn: "978-0262033848", available: true  },
  { _id: "5",  title: "The Alchemist",              author: "Paulo Coelho",        category: "Self-Help",  isbn: "978-0062315007", available: false },
  { _id: "6",  title: "Atomic Habits",              author: "James Clear",         category: "Self-Help",  isbn: "978-0735211292", available: true  },
  { _id: "7",  title: "1984",                       author: "George Orwell",       category: "Fiction",    isbn: "978-0451524935", available: true  },
  { _id: "8",  title: "The Pragmatic Programmer",   author: "Andrew Hunt",         category: "Technology", isbn: "978-0201616224", available: true  },
  { _id: "9",  title: "Sapiens",                    author: "Yuval Noah Harari",   category: "History",    isbn: "978-0062316097", available: true  },
  { _id: "10", title: "The Theory of Everything",   author: "Stephen Hawking",     category: "Science",    isbn: "978-1401308254", available: false }
];

const books = rawBooks.map((book) => ({
  _id: book._id,
  title: book.title,
  author: book.author,
  category: book.category,
  isbn: book.isbn,
  available: book.available,
  coverImage: makeCover(book.isbn),
  borrowedBy: book.available ? null : "Library record"
}));

module.exports = books;
