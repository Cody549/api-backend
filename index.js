const express = require("express");
const app = express();
const db = require("./db");

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const SECRET = "secreto123";

app.use(express.json());

// -------------------- AUTH MIDDLEWARE --------------------
function auth(req, res, next) {
  const token = req.headers["authorization"];

  if (!token) return res.json({ mensaje: "No autorizado" });

  try {
    jwt.verify(token, "secreto123");
    next();
  } catch {
    res.json({ mensaje: "Token inválido" });
  }
}

// -------------------- AUTH --------------------

// REGISTER
app.post("/register", async (req, res) => {
  const { email, password } = req.body;

  const hash = await bcrypt.hash(password, 10);

  db.query(
    "INSERT INTO usuarios (email, password) VALUES (?, ?)",
    [email, hash],
    (err) => {
      if (err) return res.json(err);
      res.json({ mensaje: "Usuario registrado" });
    },
  );
});

// LOGIN
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  db.query(
    "SELECT * FROM usuarios WHERE email = ?",
    [email],
    async (err, results) => {
      if (err) return res.json(err);
      if (results.length === 0)
        return res.json({ mensaje: "Usuario no existe" });

      const user = results[0];

      const valid = await bcrypt.compare(password, user.password);
      if (!valid) return res.json({ mensaje: "Contraseña incorrecta" });

      const token = jwt.sign({ id: user.id }, "secreto123", {
        expiresIn: "1h",
      });

      res.json({ token });
    },
  );
});

// -------------------- CRUD (PROTEGIDO) --------------------

// GET TODOS
app.get("/api/items", auth, (req, res) => {
  db.query("SELECT * FROM items", (err, results) => {
    if (err) return res.json(err);
    res.json(results);
  });
});

// GET POR ID
app.get("/api/items/:id", auth, (req, res) => {
  db.query(
    "SELECT * FROM items WHERE id = ?",
    [req.params.id],
    (err, results) => {
      if (err) return res.json(err);
      res.json(results[0] || { mensaje: "No encontrado" });
    },
  );
});

// CREATE
app.post("/api/items", auth, (req, res) => {
  const { nombre, descripcion, estado } = req.body;

  db.query(
    "INSERT INTO items (nombre, descripcion, estado) VALUES (?, ?, ?)",
    [nombre, descripcion, estado],
    (err, result) => {
      if (err) return res.json(err);
      res.json({ mensaje: "Item creado", id: result.insertId });
    },
  );
});

// UPDATE
app.put("/api/items/:id", auth, (req, res) => {
  const { nombre, descripcion, estado } = req.body;

  db.query(
    "UPDATE items SET nombre=?, descripcion=?, estado=? WHERE id=?",
    [nombre, descripcion, estado, req.params.id],
    (err) => {
      if (err) return res.json(err);
      res.json({ mensaje: "Item actualizado" });
    },
  );
});

// DELETE
app.delete("/api/items/:id", auth, (req, res) => {
  db.query("DELETE FROM items WHERE id=?", [req.params.id], (err) => {
    if (err) return res.json(err);
    res.json({ mensaje: "Item eliminado" });
  });
});

// -------------------- SERVER --------------------
app.listen(3000, () => {
  console.log("Servidor en http://localhost:3000");
});
