const express = require("express");
const cors    = require("cors");
const path    = require("path");

const app  = express();
const PORT = 3000;

// ── MIDDLEWARE ───────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// ── IN-MEMORY DATABASE ───────────────────────────────────────
let students = [
  { id: 1, name: "Arun Kumar",   email: "arun@email.com",   phone: "9876543210", age: 21, gender: "Male",   course: "B.Tech - Computer Science",       registeredAt: new Date().toLocaleString() },
  { id: 2, name: "Priya Sharma", email: "priya@email.com",  phone: "9123456780", age: 20, gender: "Female", course: "B.Sc - Data Science",             registeredAt: new Date().toLocaleString() },
  { id: 3, name: "Rahul Verma",  email: "rahul@email.com",  phone: "9988776655", age: 22, gender: "Male",   course: "MCA",                             registeredAt: new Date().toLocaleString() },
];
let nextId = 4;

// ── VALIDATION ───────────────────────────────────────────────
function validate(data) {
  const errors = [];
  if (!data.name  || data.name.trim().length < 3)                       errors.push("Name must be at least 3 characters.");
  if (!/^[a-zA-Z\s]+$/.test(data.name))                                 errors.push("Name must contain only letters.");
  if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email))   errors.push("Enter a valid email.");
  if (!data.phone || !/^\d{10}$/.test(data.phone))                      errors.push("Phone must be 10 digits.");
  const age = parseInt(data.age);
  if (!age || age < 15 || age > 60)                                      errors.push("Age must be between 15 and 60.");
  if (!data.gender)                                                       errors.push("Gender is required.");
  if (!data.course)                                                       errors.push("Course is required.");
  return errors;
}

// ── REST API ENDPOINTS ───────────────────────────────────────

// GET all students
app.get("/api/students", (req, res) => {
  res.json({ success: true, count: students.length, data: students });
});

// GET single student by ID
app.get("/api/students/:id", (req, res) => {
  const student = students.find(s => s.id === parseInt(req.params.id));
  if (!student) return res.status(404).json({ success: false, message: "Student not found." });
  res.json({ success: true, data: student });
});

// POST create new student
app.post("/api/students", (req, res) => {
  const errors = validate(req.body);
  if (errors.length > 0) return res.status(400).json({ success: false, errors });

  // Check duplicate email
  if (students.find(s => s.email === req.body.email)) {
    return res.status(400).json({ success: false, errors: ["Email already registered."] });
  }

  const student = {
    id: nextId++,
    name:         req.body.name.trim(),
    email:        req.body.email,
    phone:        req.body.phone,
    age:          parseInt(req.body.age),
    gender:       req.body.gender,
    course:       req.body.course,
    registeredAt: new Date().toLocaleString(),
  };
  students.push(student);
  res.status(201).json({ success: true, message: "Student registered successfully!", data: student });
});

// PUT update student by ID
app.put("/api/students/:id", (req, res) => {
  const idx = students.findIndex(s => s.id === parseInt(req.params.id));
  if (idx === -1) return res.status(404).json({ success: false, message: "Student not found." });

  const errors = validate(req.body);
  if (errors.length > 0) return res.status(400).json({ success: false, errors });

  students[idx] = {
    ...students[idx],
    name:   req.body.name.trim(),
    email:  req.body.email,
    phone:  req.body.phone,
    age:    parseInt(req.body.age),
    gender: req.body.gender,
    course: req.body.course,
  };
  res.json({ success: true, message: "Student updated successfully!", data: students[idx] });
});

// DELETE student by ID
app.delete("/api/students/:id", (req, res) => {
  const idx = students.findIndex(s => s.id === parseInt(req.params.id));
  if (idx === -1) return res.status(404).json({ success: false, message: "Student not found." });
  const deleted = students.splice(idx, 1)[0];
  res.json({ success: true, message: `Student "${deleted.name}" deleted successfully.` });
});

// ── SERVE FRONTEND ───────────────────────────────────────────
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => {
  console.log(`✅ REST API running at http://localhost:${PORT}`);
  console.log(`📡 API endpoints:`);
  console.log(`   GET    /api/students`);
  console.log(`   GET    /api/students/:id`);
  console.log(`   POST   /api/students`);
  console.log(`   PUT    /api/students/:id`);
  console.log(`   DELETE /api/students/:id`);
});
