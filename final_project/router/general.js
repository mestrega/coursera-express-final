const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
    const { username, password } = req.body;

    // Check if the username already exists
    if (!isValid(username)) {
        users.push({ username, password });
        return res.status(200).json({ message: "User registered successfully!" });
    } else {
        return res.status(400).json({ message: "User already exists!" });
    }
});

// Get the book list available in the shop
public_users.get('/', async function (req, res) {
    const prom = new Promise((resolve, reject) => {
        resolve(JSON.stringify(books, null, 4));
    });
    prom
        .then((response) => {
            res.send(response);
        })
        .catch((error) => {
            res.status(404).json({ message: "Error fetching book list" });
        });
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
    const isbn = req.params.isbn;
    // Check if the book exists in the database
    let foundKey = null;
    for (const key in books) {
        if (books[key].isbn === isbn) {
            foundKey = key;
            break;
        }
    }

    if (foundKey) {
        // If found, return the book details
        return res.send(JSON.stringify(books[foundKey], null, 4));
    } else {
        // If not found, return an error message
        return res.status(404).json({message: "Book not found"});
    }
 });
  
// Get book details based on author
public_users.get('/author/:author', async function (req, res) {

    const prom = new Promise((resolve, reject) => {
        const author = req.params.author;
        // Check if the book exists in the database
        let foundKey = null;
        for (const key in books) {
            if (books[key].author === author) {
                foundKey = key;
                break;
            }
        }
        if (foundKey) {
            // If found, return the book details
            resolve(JSON.stringify(books[foundKey], null, 4));
        } else {
            // If not found, return an error message
            reject({ message: "Book not found" });
        }
    });

    prom
        .then((response) => {
            res.send(response);
        })
        .catch((error) => {
            res.status(404).json(error);
        })
});

// Get all books based on title
public_users.get('/title/:title', function (req, res) {
    const prom = new Promise((resolve, reject) => {
        const title = req.params.title;
        // Check if the book exists in the database
        let foundKey = null;
        for (const key in books) {
            if (books[key].title === title) {
                foundKey = key;
                break;
            }
        }

        if (foundKey) {
            resolve(JSON.stringify(books[foundKey], null, 4));
        } else {
            reject({ message: "Book not found" });
        }
    })

    prom
        .then((response) => {
            res.send(response);
        })
        .catch((error) => {
            res.status(404).json(error);
        })
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
    const isbn = req.params.isbn;
    // Check if the book exists in the database
    let foundKey = null;
    for (const key in books) {
        if (books[key].isbn === isbn) {
            foundKey = key;
            break;
        }
    }

    if (foundKey) {
        // If found, return the book details
        return res.send(JSON.stringify(books[foundKey].reviews, null, 4));
    } else {
        // If not found, return an error message
        return res.status(404).json({message: "Book not found"});
    }
});

module.exports.general = public_users;
