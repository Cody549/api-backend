const express = require("express");
const app = express();
const db = require("./db");

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const SECRET = "secreto123";

app.use(express.json());

//////////////////////////////
// AUTH MIDDLEWARE
//////////////////////////////
function auth(req, res, next) {
  const token = req.headers["authorization"];

  if (!token) {
    return res.status(401).json({ mensaje: "No autorizado" });
  }

  try {
    const decoded = jwt.verify(token, SECRET);
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ mensaje: "Token inválido" });
  }
}

//////////////////////////////
// ROLE MIDDLEWARE
//////////////////////////////
function permitRoles(roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ mensaje: "No autorizado para esta acción" });
    }
    next();
  };
}

//////////////////////////////
// REGISTER
//////////////////////////////
app.post("/register", async (req, res) => {
  let { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ mensaje: "Faltan datos" });
  }

  const cleanEmail = email.trim().toLowerCase();

  if (password.length < 8) {
    return res.status(400).json({ mensaje: "Mínimo 8 caracteres" });
  }

  const strongPassword = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z0-9_]{8,}$/;

  if (!strongPassword.test(password)) {
    return res.status(400).json({
      mensaje: "Debe tener letras y números",
    });
  }

  db.query(
    "SELECT * FROM usuarios WHERE email = ?",
    [cleanEmail],
    async (err, result) => {
      if (err) return res.status(500).json(err);

      if (result.length > 0) {
        return res.status(409).json({ mensaje: "Usuario ya existe" });
      }

      const hash = await bcrypt.hash(password, 10);

      db.query(
        "INSERT INTO usuarios (email, password, role, intentos, bloqueado) VALUES (?, ?, 'vendedor', 0, 0)",
        [cleanEmail, hash],
        (err2) => {
          if (err2) return res.status(500).json(err2);

          res.status(201).json({
            mensaje: "Usuario registrado correctamente",
          });
        }
      );
    }
  );
});

//////////////////////////////
// LOGIN
//////////////////////////////
app.post("/login", (req, res) => {
  const { email, password } = req.body;

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

      if (user.bloqueado) {
        return res.status(403).json({ mensaje: "Usuario bloqueado" });
      }

      const valid = await bcrypt.compare(password, user.password);

      if (!valid) {
        let intentos = user.intentos + 1;
        let bloqueado = intentos >= 3;

        db.query(
          "UPDATE usuarios SET intentos=?, bloqueado=? WHERE id=?",
          [intentos, bloqueado, user.id]
        );

        return res.status(401).json({
          mensaje: bloqueado
            ? "Usuario bloqueado"
            : "Contraseña incorrecta",
        });
      }

      db.query("UPDATE usuarios SET intentos=0 WHERE id=?", [user.id]);

      const token = jwt.sign(
        {
          id: user.id,
          email: user.email,
          role: user.role,
        },
        SECRET,
        { expiresIn: "2h" }
      );

      res.json({
        mensaje: "Login correcto",
        token,
        role: user.role,
      });
    }
  );
});

//////////////////////////////
// SUPERADMIN CREA USUARIOS
//////////////////////////////
app.post(
  "/admin/create-user",
  auth,
  permitRoles(["superadmin"]),
  async (req, res) => {
    let { email, password, role } = req.body;

    const allowedRoles = ["administrador", "vendedor", "superadmin"];

    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ mensaje: "Role inválido" });
    }

    const cleanEmail = email.trim().toLowerCase();
    const hash = await bcrypt.hash(password, 10);

    db.query(
      "INSERT INTO usuarios (email, password, role, intentos, bloqueado) VALUES (?, ?, ?, 0, 0)",
      [cleanEmail, hash, role],
      (err) => {
        if (err) return res.status(500).json(err);

        res.json({
          mensaje: "Usuario creado por superadmin",
          role,
        });
      }
    );
  }
);

//////////////////////////////
// CRUD ITEMS
//////////////////////////////

// VER TODOS (todos roles)
app.get(
  "/api/items",
  auth,
  permitRoles(["superadmin", "administrador", "vendedor"]),
  (req, res) => {
    db.query("SELECT * FROM items", (err, results) => {
      if (err) return res.json(err);
      res.json(results);
    });
  }
);

// VER POR ID
app.get(
  "/api/items/:id",
  auth,
  permitRoles(["superadmin", "administrador", "vendedor"]),
  (req, res) => {
    db.query(
      "SELECT * FROM items WHERE id = ?",
      [req.params.id],
      (err, results) => {
        if (err) return res.json(err);
        res.json(results[0] || { mensaje: "No encontrado" });
      }
    );
  }
);

// CREAR ITEM
app.post(
  "/api/items",
  auth,
  permitRoles(["superadmin", "administrador", "vendedor"]),
  (req, res) => {
    const { nombre, descripcion, estado } = req.body;

    db.query(
      "INSERT INTO items (nombre, descripcion, estado) VALUES (?, ?, ?)",
      [nombre, descripcion, estado],
      (err, result) => {
        if (err) return res.json(err);
        res.json({ mensaje: "Item creado", id: result.insertId });
      }
    );
  }
);

// ACTUALIZAR ITEM
app.put(
  "/api/items/:id",
  auth,
  permitRoles(["superadmin", "administrador"]),
  (req, res) => {
    const { nombre, descripcion, estado } = req.body;

    db.query(
      "UPDATE items SET nombre=?, descripcion=?, estado=? WHERE id=?",
      [nombre, descripcion, estado, req.params.id],
      (err) => {
        if (err) return res.json(err);
        res.json({ mensaje: "Item actualizado" });
      }
    );
  }
);

// ELIMINAR ITEM
app.delete(
  "/api/items/:id",
  auth,
  permitRoles(["superadmin"]),
  (req, res) => {
    db.query("DELETE FROM items WHERE id=?", [req.params.id], (err) => {
      if (err) return res.json(err);
      res.json({ mensaje: "Item eliminado" });
    });
  }
);

// desbloquear usuario (superadmin)

app.put(
  "/admin/unlock-user/:id",
  auth,
  permitRoles(["superadmin", "administrador"]),
  (req, res) => {
    const userId = req.params.id;

    db.query(
      "UPDATE usuarios SET intentos = 0, bloqueado = 0 WHERE id = ?",
      [userId],
      (err) => {
        if (err) return res.status(500).json(err);

        res.json({
          mensaje: "Usuario desbloqueado correctamente",
        });
      }
    );
  }
);

// Ver todos los usuarios(superadmin)

app.get(
  "/admin/users",
  auth,
  permitRoles(["superadmin"]),
  (req, res) => {
    db.query(
      "SELECT id, email, role, intentos, bloqueado FROM usuarios",
      (err, results) => {
        if (err) return res.status(500).json(err);

        res.json({
          usuarios: results,
        });
      }
    );
  }
);

//VER SOLO USUARIOS BLOQUEADOS

app.get(
  "/admin/users/bloqueados",
  auth,
  permitRoles(["superadmin"]),
  (req, res) => {
    db.query(
      "SELECT id, email, role, intentos, bloqueado FROM usuarios WHERE bloqueado = 1",
      (err, results) => {
        if (err) return res.status(500).json(err);

        res.json({
          usuarios_bloqueados: results,
        });
      }
    );
  }
);

// Ver usuarios por Rol

app.get(
  "/admin/users/rol/:role",
  auth,
  permitRoles(["superadmin"]),
  (req, res) => {
    const role = req.params.role;

    db.query(
      "SELECT id, email, role, intentos, bloqueado FROM usuarios WHERE role = ?",
      [role],
      (err, results) => {
        if (err) return res.status(500).json(err);

        res.json({
          role: role,
          usuarios: results,
        });
      }
    );
  }
);


//////////////////////////////
// SERVER
//////////////////////////////
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Servidor en puerto " + PORT);
});