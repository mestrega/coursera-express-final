const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
    // Filter the users array for any user with the same username
    let userswithsamename = users.filter((user) => {
        return user.username === username;
    });
    // Return true if any user with the same username is found, otherwise false
    if (userswithsamename.length > 0) {
        return true;
    } else {
        return false;
    }
}

const authenticatedUser = (username,password)=>{ //returns boolean
    // Filter the users array for any user with the same username and password
    let validusers = users.filter((user) => {
        return (user.username === username && user.password === password);
    });
    // Return true if any valid user is found, otherwise false
    if (validusers.length > 0) {
        return true;
    } else {
        return false;
    }
}

//only registered users can login
regd_users.post("/login", (req,res) => {
    const username = req.body.username;
    const password = req.body.password;

    // Check if username or password is missing
    if (!username || !password) {
        return res.status(404).json({ message: "Error logging in" });
    }
    // Authenticate user
    if (authenticatedUser(username, password)) {
        // Generate JWT access token
        let accessToken = jwt.sign({
            data: password
        }, 'access', { expiresIn: 60 * 60 });

        // Store access token and username in session
        req.session.authorization = {
            accessToken, username
        }
        return res.status(200).send("User successfully logged in");
    } else {
        return res.status(208).json({ message: "Invalid Login. Check username and password" });
    }
  //Write your code here
  //return res.status(300).json({message: "Yet to be implemented"});
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {

    const isbn = req.params.isbn;

    const review = req.body.review;
    const username = req.session.authorization.username;

    // Check if the book exists in the database
    let foundKey = null;
    for (const key in books) {
        if (books[key].isbn === isbn) {
            foundKey = key;
            break;
        }
    }

    if (!foundKey) {
        return res.status(404).json({ message: "Book not found" });
    }

    // If the book exists, add the review
    if (!books[foundKey].reviews) {
        books[foundKey].reviews = {}; // Initialize reviews if not present
    }

    let reviewExists = false;

    if (books[foundKey].reviews.hasOwnProperty(username)) {
        reviewExists = true;
    }

    // Add the review under the username
    books[foundKey].reviews[username] = review;

    let writeMessage = "Review " + (reviewExists ? "updated" : "added" ) + " successfully.";

    return res.status(200).json({ message: writeMessage });
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const username = req.session.authorization.username;
    // Check if the book exists in the database
    let foundKey = null;
    for (const key in books) {
        if (books[key].isbn === isbn) {
            foundKey = key;
            break;
        }
    }
    if (!foundKey) {
        return res.status(404).json({ message: "Book not found" });
    }
    // If the book exists, check if the user has a review
    if (books[foundKey].reviews && books[foundKey].reviews.hasOwnProperty(username)) {
        delete books[foundKey].reviews[username]; // Remove the review
        return res.status(200).json({ message: "Review deleted successfully" });
    } else {
        return res.status(404).json({ message: "Review not found for this user" });
    }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
