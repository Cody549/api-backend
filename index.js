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
  let { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ mensaje: "Faltan datos" });
  }

  // limpiar email
  const cleanEmail = email.trim().toLowerCase();

  if (password.length < 8) {
    return res.status(400).json({ mensaje: "Mínimo 8 caracteres" });
  }

  const strongPassword = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z0-9_]{8,}$/;

  if (!strongPassword.test(password)) {
    return res.status(400).json({
      mensaje: "Debe tener letras y números (mínimo 8 caracteres)",
    });
  }

  // verificar si usuario existe
  db.query(
    "SELECT * FROM usuarios WHERE email = ?",
    [cleanEmail],
    async (err, result) => {
      if (err) return res.status(500).json(err);

      if (result.length > 0) {
        return res.status(409).json({ mensaje: "El usuario ya existe" });
      }

      const hash = await bcrypt.hash(password, 10);

      db.query(
        "INSERT INTO usuarios (email, password) VALUES (?, ?)",
        [cleanEmail, hash],
        (err2) => {
          if (err2) return res.status(500).json(err2);

          res.status(201).json({
            mensaje: "Usuario registrado correctamente",
          });
        },
      );
    },
  );
});

// LOGIN
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ mensaje: "Faltan datos" });
  }

  const cleanEmail = email.trim().toLowerCase();

  db.query(
    "SELECT * FROM usuarios WHERE email = ?",
    [cleanEmail],
    async (err, results) => {
      if (err) return res.status(500).json(err);

      if (results.length === 0) {
        return res.status(404).json({ mensaje: "Usuario no existe" });
      }

      const user = results[0];

      const valid = await bcrypt.compare(password, user.password);

      if (!valid) {
        return res.status(401).json({ mensaje: "Contraseña incorrecta" });
      }

      const token = jwt.sign(
        {
          id: user.id,
          email: user.email,
        },
        "secreto123",
        { expiresIn: "2h" },
      );

      res.status(200).json({
        mensaje: "Login correcto",
        token,
      });
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
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Servidor en puerto " + PORT);
});
