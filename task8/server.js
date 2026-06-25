const express  = require("express");
const mongoose = require("mongoose");
const bcrypt   = require("bcryptjs");
const session  = require("express-session");
const path     = require("path");

const app  = express();
const PORT = 3000;

// ── CONNECT MONGODB ───────────────────────────────────────
mongoose.connect("mongodb://localhost:27017/cognifyz_task6")
  .then(() => console.log("✅ MongoDB connected!"))
  .catch(err => console.log("❌ MongoDB error:", err.message));

// ── USER SCHEMA ───────────────────────────────────────────
const userSchema = new mongoose.Schema({
  name:      { type: String, required: true },
  email:     { type: String, required: true, unique: true },
  password:  { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});
const User = mongoose.model("User", userSchema);

// ── MIDDLEWARE ────────────────────────────────────────────
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(session({
  secret: "cognifyz_secret_key",
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 }, // 1 hour
}));

// ── AUTH MIDDLEWARE ───────────────────────────────────────
function requireAuth(req, res, next) {
  if (req.session.userId) return next();
  res.redirect("/login");
}

// ── ROUTES ────────────────────────────────────────────────

// Home → redirect
app.get("/", (req, res) => {
  if (req.session.userId) return res.redirect("/dashboard");
  res.redirect("/login");
});

// REGISTER
app.get("/register", (req, res) => {
  if (req.session.userId) return res.redirect("/dashboard");
  res.render("register", { error: null, success: null });
});

app.post("/register", async (req, res) => {
  const { name, email, password, confirmPassword } = req.body;
  const errors = [];

  if (!name || name.trim().length < 2)              errors.push("Name must be at least 2 characters.");
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push("Enter a valid email.");
  if (!password || password.length < 6)             errors.push("Password must be at least 6 characters.");
  if (password !== confirmPassword)                  errors.push("Passwords do not match.");

  if (errors.length > 0) return res.render("register", { error: errors.join(" | "), success: null });

  try {
    const existing = await User.findOne({ email });
    if (existing) return res.render("register", { error: "Email already registered.", success: null });

    const hashed = await bcrypt.hash(password, 10);
    await User.create({ name: name.trim(), email, password: hashed });
    res.render("register", { error: null, success: "Account created! Please login." });
  } catch (err) {
    res.render("register", { error: "Something went wrong. Try again.", success: null });
  }
});

// LOGIN
app.get("/login", (req, res) => {
  if (req.session.userId) return res.redirect("/dashboard");
  res.render("login", { error: null });
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.render("login", { error: "All fields are required." });

  const user = await User.findOne({ email });
  if (!user) return res.render("login", { error: "No account found with this email." });

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.render("login", { error: "Incorrect password." });

  req.session.userId   = user._id;
  req.session.userName = user.name;
  res.redirect("/dashboard");
});

// DASHBOARD (protected)
app.get("/dashboard", requireAuth, async (req, res) => {
  const user  = await User.findById(req.session.userId);
  const users = await User.find().select("-password").sort({ createdAt: -1 });
  res.render("dashboard", { user, users });
});

// LOGOUT
app.get("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/login");
});

app.listen(PORT, () => {
  console.log(`✅ Auth App running at http://localhost:${PORT}`);
  console.log(`📌 Make sure MongoDB is running!`);
});
