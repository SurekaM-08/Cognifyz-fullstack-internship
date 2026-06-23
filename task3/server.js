const express = require("express");
const app = express();
const PORT = 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set("view engine", "ejs");

let students = [];

// Validation
function validateStudent(data) {
  const errors = [];
  if (!data.name || data.name.trim().length < 3) errors.push("Name must be at least 3 characters.");
  if (!/^[a-zA-Z\s]+$/.test(data.name))          errors.push("Name must contain only letters.");
  if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) errors.push("Enter a valid email.");
  if (!data.phone || !/^\d{10}$/.test(data.phone)) errors.push("Phone must be exactly 10 digits.");
  const age = parseInt(data.age);
  if (!age || age < 15 || age > 60) errors.push("Age must be between 15 and 60.");
  if (!data.gender)  errors.push("Please select a gender.");
  if (!data.course)  errors.push("Please select a course.");
  if (!data.dob)     errors.push("Please enter your date of birth.");
  return errors;
}

// Routes
app.get("/", (req, res) => {
  res.render("index", { errors: [], old: {}, students });
});

app.post("/register", (req, res) => {
  const errors = validateStudent(req.body);
  if (errors.length > 0) {
    return res.render("index", { errors, old: req.body, students });
  }
  const student = {
    id: students.length + 1,
    name: req.body.name.trim(),
    email: req.body.email,
    phone: req.body.phone,
    age: req.body.age,
    gender: req.body.gender,
    course: req.body.course,
    dob: req.body.dob,
    registeredAt: new Date().toLocaleString(),
  };
  students.push(student);
  res.render("success", { student, totalStudents: students.length });
});

app.get("/students", (req, res) => {
  res.render("students", { students });
});

app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
