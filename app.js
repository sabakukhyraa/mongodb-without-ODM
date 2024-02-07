require("dotenv").config();

const { ObjectId } = require("mongodb");
const { connectToDb, getDb } = require("./db.js");

const express = require("express");

// init ap & middleware
const app = express();
app.use(express.json());

// db connection
let db;

connectToDb((err) => {
  if (!err) {
    console.log("Database connection success.");
    app.listen(process.env.PORT, () => {
      console.log(`Server is running on port ${process.env.PORT}`);
    });

    db = getDb();
  } else {
    console.log("Connection failed!");
  }
});

app.get("/books", (req, res) => {
  const page = req.query.page || 0;
  const booksPerPage = 2;

  let books = [];

  db.collection("books")
    .find()
    .sort({ title: 1 })
    .skip(page * booksPerPage)
    .limit(booksPerPage)
    .forEach((book) => books.push(book))
    .then(() => {
      res.status(200).json(books);
    })
    .catch(() => {
      res.status(500).json({ error: "Couldn't fetch the documents." });
    });
});

app.get("/books/:id", (req, res) => {
  if (ObjectId.isValid(req.params.id)) {
    db.collection("books")
      .findOne({ _id: new ObjectId(req.params.id) })
      .then((doc) => {
        res.status(200).json(doc);
      })
      .catch((err) => {
        res.status(500).json({ error: "Couldn't fetch the document." });
      });
  } else {
    res.status(500).json({ error: "Invalid book ID" });
  }
});

app.post("/books", (req, res) => {
  const book = req.body;

  db.collection("books")
    .insertOne(book)
    .then((result) => {
      res.status(201).json(result);
    })
    .catch((err) => {
      res.status(500).json({ error: "Couldn't create a new document." });
    });
});

app.delete("/books/:id", (req, res) => {
  if (ObjectId.isValid(req.params.id)) {
    db.collection("books")
      .deleteOne({ _id: new ObjectId(req.params.id) })
      .then((result) => {
        res.status(202).json(result);
      })
      .catch((err) => {
        res.status(500).json({ error: "Couldn't delete the document." });
      });
  } else {
    res.status(500).json({ error: "Invalid book ID" });
  }
});

app.patch("/books/:id", (req, res) => {
  const updates = req.body;

  if (ObjectId.isValid(req.params.id)) {
    db.collection("books")
      .updateOne({ _id: new ObjectId(req.params.id) }, { $set: updates })
      .then((result) => {
        res.status(202).json(result);
      })
      .catch((err) => {
        res.status(500).json({ error: "Couldn't update the document." });
      });
  } else {
    res.status(500).json({ error: "Invalid book ID" });
  }
});
