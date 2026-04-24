const bcrypt = require("bcryptjs");
const db = require("./db");

bcrypt.hash("123456", 10).then((hash) => {
  console.log("HASH COMPLETO:", hash);

  db.query(
    "INSERT INTO usuarios (email, password) VALUES (?, ?)",
    ["test@gmail.com", hash],
    (err) => {
      if (err) console.log(err);
      else console.log("Usuario creado OK");
    },
  );
});
