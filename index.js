
// Load environment variables
// We use 'dotenv' so our database login and settings are stored in a separate 
// file instead of inside our code. That makes it safer and easier to change per machine.
require('dotenv').config();


const express = require("express"); // Imports Express, the framework we use to build the web server and define routes.
const path = require("path"); // Built-in Node module for working with file paths in a safe, cross-platform way.
const knex = require("knex")({ 
  client: "pg", // tells Knex we're using PostgreSQL.
  connection: {
    host : process.env.DB_HOST || "localhost",
    user : process.env.DB_USER || "postgres",
    password : process.env.DB_PASSWORD || "admin",
    database : process.env.DB_NAME || "mtc",
    port : process.env.DB_PORT || 5432,
    ssl: { rejectUnauthorized: false }
  }
}); // Knex allows you to talk to the Database. We set up Knex here so we can 
// talk to our PostgreSQL database using JavaScript instead of raw SQL everywhere

// app is our web server. port is where it listens for requests (like the ‘door’ number).
const app = express(); // Creates an Express app object. Almost everything (routes, middleware) gets attached to this.
const port = process.env.PORT || 3000; // Server listening on port 3000

// EJS lets us mix HTML with dynamic data. These lines tell Express to use EJS and where to find our page templates.
app.set("view engine", "ejs"); // Tells Express: “When we call res.render(...), use EJS files to build the HTML
app.set("views", path.join(__dirname, "views")); // Tells Express where the EJS templates live.

// Middleware to parse form data
app.use(express.urlencoded({ extended: true })); // This line lets us read form inputs easily with req.body.whatever
app.use(express.static("public"));

const session = require("express-session");

//Without sessions, every request is independent.
// Sessions allow your app to remember:
// which user logged in
// their username
// their manager/user level
// whether they are authenticated
// any temporary data you need
app.use(
  // This enables sessions in your Express app.
 // Without sessions, your login system does not work — period.
  session({
    secret: process.env.SESSION_SECRET || 'fallback-secret-key',
    resave: false,
    saveUninitialized: false,
  })
);

// ---- ROUTES ----

app.get("/", async (req, res) => {
    res.render("index");

});

// Start the server
app.listen(port, () => {
  console.log(`✅ Server running on http://localhost:${port}`);
});