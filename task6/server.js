const express = require("express");
const path = require("path");
const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// In-memory todo storage
let todos = [
  { id: 1, text: "Learn Node.js", priority: "high",   done: false, createdAt: new Date().toLocaleString() },
  { id: 2, text: "Build REST API", priority: "medium", done: false, createdAt: new Date().toLocaleString() },
  { id: 3, text: "Study Bootstrap", priority: "low",   done: true,  createdAt: new Date().toLocaleString() },
];
let nextId = 4;

// GET all todos
app.get("/api/todos", (req, res) => {
  res.json({ success: true, data: todos });
});

// POST add todo
app.post("/api/todos", (req, res) => {
  const { text, priority } = req.body;
  if (!text || text.trim() === "")
    return res.status(400).json({ success: false, message: "Todo text is required." });
  const todo = { id: nextId++, text: text.trim(), priority: priority || "medium", done: false, createdAt: new Date().toLocaleString() };
  todos.push(todo);
  res.status(201).json({ success: true, data: todo });
});

// PUT toggle done / edit
app.put("/api/todos/:id", (req, res) => {
  const todo = todos.find(t => t.id === parseInt(req.params.id));
  if (!todo) return res.status(404).json({ success: false, message: "Todo not found." });
  if (req.body.hasOwnProperty("done")) todo.done = req.body.done;
  if (req.body.text)     todo.text     = req.body.text.trim();
  if (req.body.priority) todo.priority = req.body.priority;
  res.json({ success: true, data: todo });
});

// DELETE todo
app.delete("/api/todos/:id", (req, res) => {
  const idx = todos.findIndex(t => t.id === parseInt(req.params.id));
  if (idx === -1) return res.status(404).json({ success: false, message: "Todo not found." });
  todos.splice(idx, 1);
  res.json({ success: true, message: "Deleted!" });
});

app.get("/", (req, res) => res.sendFile(path.join(__dirname, "public", "index.html")));

app.listen(PORT, () => console.log(`✅ Todo App running at http://localhost:${PORT}`));
