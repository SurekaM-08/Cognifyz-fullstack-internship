const express = require("express");
const app = express();
const PORT = 3000;

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

// Set EJS as the templating engine
app.set("view engine", "ejs");

// Temporary in-memory storage for registered students
let students = [];

// ─── ROUTES ────────────────────────────────────────────────

// GET / → Show the registration form
app.get("/", (req, res) => {
  res.render("index", { title: "Student Registration" });
});

// POST /register → Handle form submission
app.post("/register", (req, res) => {
  const { name, email, age, course } = req.body;

  // Save to temporary storage
  const student = {
    id: students.length + 1,
    name,
    email,
    age,
    course,
    registeredAt: new Date().toLocaleString(),
  };
  students.push(student);

  // Render success page with student data
  res.render("success", { student });
});

// GET /students → Show all registered students
app.get("/students", (req, res) => {
  res.render("students", { students });
});

// Start the server
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
